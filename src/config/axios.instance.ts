import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { clearStoredToken, getStoredToken, setStoredToken } from "@/utils/jwt";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

interface RefreshResponseData {
    accessToken?: string;
    access_token?: string;
    token?: string;
    data?: {
        accessToken?: string;
        access_token?: string;
        token?: string;
    };
}

const REFRESH_ENDPOINT = process.env.NEXT_PUBLIC_REFRESH_TOKEN_ENDPOINT ?? "/auth/refresh";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    timeout: 10000,
    withCredentials: true,
});

const isRefreshRequest = (url?: string): boolean => {
    if (!url) return false;
    return url.includes(REFRESH_ENDPOINT);
};

const extractAccessToken = (payload: RefreshResponseData): string | null => {
    return (
        payload.accessToken ??
        payload.access_token ??
        payload.token ??
        payload.data?.accessToken ??
        payload.data?.access_token ??
        payload.data?.token ??
        null
    );
};

let isRefreshing = false;
let queuedRequests: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

const flushQueue = (error: unknown, token: string | null): void => {
    queuedRequests.forEach((request) => {
        if (error || !token) {
            request.reject(error);
            return;
        }

        request.resolve(token);
    });

    queuedRequests = [];
};

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getStoredToken();

        if (token && !isRefreshRequest(config.url)) {
            const headers = config.headers as Record<string, string>;
            headers.Authorization = `Bearer ${token}`;
        }

        console.log("➡️ FULL REQUEST URL:", `${config.baseURL ?? ""}${config.url ?? ""}`);
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        console.log("⬅️ FULL RESPONSE DATA FROM AXIOS INSTANCE:", response.data);
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as RetryableRequestConfig | undefined;
        const isUnauthorized = error.response?.status === 401;

        if (!originalRequest || !isUnauthorized || originalRequest._retry || isRefreshRequest(originalRequest.url)) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (isRefreshing) {
            return new Promise<string>((resolve, reject) => {
                queuedRequests.push({ resolve, reject });
            }).then((token) => {
                const headers = originalRequest.headers as Record<string, string>;
                headers.Authorization = `Bearer ${token}`;
                return axiosInstance(originalRequest);
            });
        }

        isRefreshing = true;

        try {
            const refreshResponse = await axios.post<RefreshResponseData>(
                REFRESH_ENDPOINT,
                {},
                {
                    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
                    withCredentials: true,
                    timeout: 10000,
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
            );

            const newAccessToken = extractAccessToken(refreshResponse.data);

            if (!newAccessToken) {
                throw new Error("Refresh endpoint did not return an access token");
            }

            setStoredToken(newAccessToken);
            flushQueue(null, newAccessToken);

            const headers = originalRequest.headers as Record<string, string>;
            headers.Authorization = `Bearer ${newAccessToken}`;

            return axiosInstance(originalRequest);
        } catch (refreshError) {
            clearStoredToken();
            flushQueue(refreshError, null);
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default axiosInstance;

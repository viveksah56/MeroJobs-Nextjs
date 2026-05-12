import { jwtDecode } from "jwt-decode";
import type { JwtPayload, AuthUser, Role, Authority } from "@/types/auth";

export function decodeJwt(token: string): JwtPayload | null {
    try {
        return jwtDecode<JwtPayload>(token);
    } catch {
        return null;
    }
}

export function isTokenExpired(token: string): boolean {
    const payload = decodeJwt(token);
    if (!payload) return true;
    return Date.now() >= payload.exp * 1000;
}

export function getAuthUser(token: string | null | undefined): AuthUser | null {
    if (!token) return null;
    const payload = decodeJwt(token);
    if (!payload || Date.now() >= payload.exp * 1000) return null;
    return {
        email: payload.sub,
        userId: payload.userId,
        roles: payload.roles ?? [],
        authorities: payload.authorities ?? [],
        isExpired: false,
    };
}

export function hasRole(token: string, role: Role): boolean {
    return getAuthUser(token)?.roles.includes(role) ?? false;
}

export function hasAllRoles(token: string, roles: Role[]): boolean {
    const user = getAuthUser(token);
    if (!user) return false;
    return roles.every((r) => user.roles.includes(r));
}

export function hasAnyRole(token: string, roles: Role[]): boolean {
    const user = getAuthUser(token);
    if (!user) return false;
    return roles.some((r) => user.roles.includes(r));
}

export function hasAuthority(token: string, authority: Authority): boolean {
    return getAuthUser(token)?.authorities.includes(authority) ?? false;
}

const TOKEN_COOKIE = "access_token";

function parseCookies(): Record<string, string> {
    if (typeof document === "undefined") return {};
    return Object.fromEntries(
        document.cookie
            .split("; ")
            .filter(Boolean)
            .map((pair) => {
                const idx = pair.indexOf("=");
                return [pair.slice(0, idx), decodeURIComponent(pair.slice(idx + 1))];
            })
    );
}

export function getStoredToken(): string | null {
    if (typeof document === "undefined") return null;
    return parseCookies()[TOKEN_COOKIE] ?? null;
}

export function setStoredToken(token: string, maxAgeSeconds = 3600): void {
    if (typeof document === "undefined") return;
    const payload = decodeJwt(token);
    const age = payload
        ? Math.floor((payload.exp * 1000 - Date.now()) / 1000)
        : maxAgeSeconds;
    document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; max-age=${age}; path=/; SameSite=Strict`;
}

export function clearStoredToken(): void {
    if (typeof document === "undefined") return;
    document.cookie = `${TOKEN_COOKIE}=; max-age=0; path=/; SameSite=Strict`;
}
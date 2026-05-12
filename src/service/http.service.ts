class HttpService {
    private headers: Record<string, string> = {};

    private setHeader(key: string, value: string) {
        this.headers[key] = value;

        if (key === "Authorization") {
            this.headers[key] = `Bearer ${value}`;
        }
        if (key === "Content-Type") {
            this.headers[key] = value;
        }
    }

    constructor() {

    }

    async getRequest<TResponse=any>(url: string, headers: Record<string, string> = {}) {

    }

    async postRequest<T>(url: string) {

    }

}

export default HttpService;

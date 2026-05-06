export type Role = "JOBSEEKER" | "EMPLOYER" | "ADMIN";
export type Authority = `ROLE_${Role}` | "FACTOR_PASSWORD" | string;

export interface JwtPayload {
    sub: string;
    jti: string;
    iat: number;
    exp: number;
    type: "ACCESS" | "REFRESH";
    roles: Role[];
    authorities: Authority[];
    userId: string;
}

export interface AuthUser {
    email: string;
    userId: string;
    roles: Role[];
    authorities: Authority[];
    isExpired: boolean;
}
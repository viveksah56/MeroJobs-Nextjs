"use client";

import {useCallback, useEffect} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import Link from "next/link";
import {AlertCircle, ArrowRight, Loader2} from "lucide-react";
import {AxiosError} from "axios";

import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {PasswordInputField} from "@/components/form-field/password-input";
import {TextInputField} from "@/components/form-field/text-input";
import {useAuth} from "@/hooks/useAuth";

const loginSchema = z.object({
    email: z
        .email("Enter a valid email address")
        .min(1, "Email is required"),

    password: z
        .string()
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters"),
    remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

function MeroJobsLogo({className}: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
        >
            <rect width="40" height="40" rx="10" fill="currentColor" fillOpacity="0.1"/>
            <path
                d="M10 28V12l8 10 8-10v16"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="30" cy="20" r="3" fill="currentColor"/>
        </svg>
    );
}

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false">
            <path
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                fill="#4285F4"
            />
            <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                fill="#34A853"
            />
            <path
                d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                fill="#FBBC05"
            />
            <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                fill="#EA4335"
            />
        </svg>
    );
}

export function LoginForm() {
    const {login, isLoading, isHydrated, error} = useAuth();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: {errors},
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {email: "", password: "", remember: false},
        mode: "onTouched",
    });

    const rememberValue = watch("remember");

    const onSubmit = useCallback(
        async (data: LoginFormData) => {
            try {
                await login(data.email, data.password);
            } catch (err) {
                const axiosError = err as AxiosError<{ message: string }>;
                console.error("Login error:", axiosError);
            }
        },
        [login]
    );

    if (!isHydrated) {
        return null;
    }

    const errorMessage = error
        ? (error as AxiosError<{ message: string }>).response?.data?.message || "Invalid credentials. Please try again."
        : null;

    return (
        <div
            className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-10 sm:py-12">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute right-[-10%] top-[-20%] h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[100px] sm:h-[600px] sm:w-[600px]"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-[-10%] left-[-5%] h-[300px] w-[300px] rounded-full bg-indigo-500/8 blur-[100px] sm:h-[450px] sm:w-[450px]"
            />

            <div
                className="relative w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500 sm:max-w-[420px]">
                <div
                    className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/5 dark:shadow-black/20 sm:p-8 md:p-10">
                    <div
                        className="mb-7 space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100 sm:mb-8 sm:space-y-5">
                        <div className="flex items-center gap-2.5">
                            <MeroJobsLogo className="h-8 w-8 text-blue-600 dark:text-blue-500 sm:h-9 sm:w-9"/>
                            <span className="text-base font-bold tracking-tight text-foreground sm:text-[1.0625rem]">
                Mero Jobs
              </span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                                Welcome back
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Sign in to continue to find your dream job
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        noValidate
                        aria-label="Sign in form"
                        className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-150"
                    >
                        {errorMessage && (
                            <Alert variant="destructive" role="alert" aria-live="assertive" aria-atomic="true">
                                <AlertCircle className="h-4 w-4"/>
                                <AlertDescription>{errorMessage}</AlertDescription>
                            </Alert>
                        )}

                        <TextInputField
                            type="email"
                            label="Email"
                            placeholder="your@email.com"
                            error={errors.email?.message}
                            disabled={isLoading}
                            autoComplete="email"
                            required
                            {...register("email")}
                        />

                        <PasswordInputField
                            label="Password"
                            placeholder="Your password"
                            error={errors.password?.message}
                            disabled={isLoading}
                            autoComplete="current-password"
                            required
                            {...register("password")}
                        />

                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="remember"
                                    checked={!!rememberValue}
                                    onCheckedChange={(checked) => setValue("remember", !!checked)}
                                    disabled={isLoading}
                                    aria-label="Remember me for 30 days"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="cursor-pointer select-none text-[0.8125rem] text-muted-foreground"
                                >
                                    Remember me
                                </Label>
                            </div>
                            <Link
                                href="/forgot-password"
                                className="text-[0.8125rem] font-medium text-blue-600 transition-opacity hover:opacity-75 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-blue-500"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            aria-busy={isLoading}
                            aria-label={isLoading ? "Signing in, please wait" : "Sign in to your account"}
                            className="mt-1 h-10 w-full rounded-xl text-sm font-semibold tracking-tight sm:h-11 sm:text-[0.9375rem]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true"/>
                                    Signing in…
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight className="h-4 w-4" aria-hidden="true"/>
                                </>
                            )}
                        </Button>

                        <div
                            className="relative flex items-center gap-3 text-xs text-muted-foreground"
                            aria-hidden="true"
                        >
                            <span className="flex-1 border-t border-border"/>
                            or
                            <span className="flex-1 border-t border-border"/>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            disabled={isLoading}
                            aria-label="Continue with Google SSO"
                            className="h-[42px] w-full rounded-xl text-sm font-medium"
                        >
                            <GoogleIcon/>
                            Continue with Google
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-[0.8125rem] text-muted-foreground animate-in fade-in duration-500 delay-300">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/register"
                            className="font-medium text-blue-600 transition-opacity hover:opacity-75 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-blue-500"
                        >
                            Request access
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

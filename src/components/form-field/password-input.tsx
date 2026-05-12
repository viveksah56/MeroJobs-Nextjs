"use client";

import { memo, useId, useCallback, useState } from "react";
import type { ComponentProps, ElementType, Ref, SVGProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";

type PasswordAutoComplete = "current-password" | "new-password" | "one-time-code";

export interface PasswordInputFieldProps
    extends Omit<ComponentProps<"input">, "type" | "autoComplete"> {
    label?: string;
    error?: string;
    description?: string;
    icon?: ElementType<SVGProps<SVGSVGElement>>;
    autoComplete?: PasswordAutoComplete;
    ref?: Ref<HTMLInputElement>;
}

const PasswordInputField = memo(function PasswordInputField({
                                                                className,
                                                                label,
                                                                error,
                                                                description,
                                                                icon: Icon,
                                                                required,
                                                                disabled,
                                                                id: externalId,
                                                                autoComplete = "current-password",
                                                                ref,
                                                                ...props
                                                            }: PasswordInputFieldProps) {
    const generatedId = useId();
    const id = externalId ?? generatedId;
    const errorId = `${id}-error`;
    const descriptionId = `${id}-description`;

    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    const hasError = Boolean(error);
    const hasDescription = Boolean(description);

    const ariaDescribedBy =
        [hasError && errorId, hasDescription && descriptionId]
            .filter(Boolean)
            .join(" ") || undefined;

    const sharedInputProps = {
        id,
        required,
        disabled,
        "aria-invalid": hasError || undefined,
        "aria-required": required,
        "aria-describedby": ariaDescribedBy,
    } as const;

    return (
        <Field className="w-full space-y-1.5">
            {label && (
                <FieldLabel
                    htmlFor={id}
                    className={cn(
                        "block text-sm font-medium leading-none",
                        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                        hasError ? "text-destructive dark:text-destructive" : "text-foreground dark:text-foreground",
                        disabled && "cursor-not-allowed opacity-50"
                    )}
                >
                    {label}
                    {required && (
                        <span className="ml-1 text-destructive" aria-hidden="true">
              *
            </span>
                    )}
                </FieldLabel>
            )}

            {hasDescription && (
                <FieldDescription
                    id={descriptionId}
                    className="break-words text-xs text-muted-foreground dark:text-muted-foreground"
                >
                    {description}
                </FieldDescription>
            )}

            <div className="relative w-full">
                {Icon && (
                    <span
                        className={cn(
                            "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2",
                            "text-muted-foreground dark:text-muted-foreground",
                            disabled && "opacity-50"
                        )}
                        aria-hidden="true"
                    >
            <Icon className="h-4 w-4 shrink-0" />
          </span>
                )}

                <Input
                    ref={ref}
                    {...sharedInputProps}
                    type={showPassword ? "text" : "password"}
                    autoComplete={autoComplete}
                    className={cn(
                        "w-full pr-10 px-3 sm:px-4",
                        "bg-background text-foreground",
                        "dark:bg-background dark:text-foreground",
                        "placeholder:text-muted-foreground dark:placeholder:text-muted-foreground",
                        "border-input dark:border-input",
                        "transition-colors duration-150 ease-out",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        Icon && "pl-10",
                        hasError && "border-destructive focus-visible:ring-destructive dark:border-destructive",
                        className
                    )}
                    {...props}
                />

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    tabIndex={-1}
                    disabled={disabled}
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-controls={id}
                    aria-pressed={showPassword}
                    className={cn(
                        "absolute right-0 top-0 h-full px-3 py-2",
                        "hover:bg-transparent dark:hover:bg-transparent",
                        "focus-visible:ring-1 focus-visible:ring-ring",
                        "text-muted-foreground dark:text-muted-foreground"
                    )}
                >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                </Button>
            </div>

            {hasError && (
                <FieldDescription
                    id={errorId}
                    role="alert"
                    aria-live="polite"
                    className="wrap-break-word text-sm text-destructive dark:text-destructive"
                >
                    {error}
                </FieldDescription>
            )}
        </Field>
    );
});

PasswordInputField.displayName = "PasswordInputField";

export { PasswordInputField };
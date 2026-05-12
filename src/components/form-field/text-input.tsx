"use client";

import { memo, useId } from "react";
import type { ComponentProps, ElementType, SVGProps } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";

interface CommonProps {
    label?: string;
    error?: string;
    icon?: ElementType<SVGProps<SVGSVGElement>>;
    required?: boolean;
    className?: string;
    helperText?: string;
}

interface InputFieldProps
    extends Omit<ComponentProps<"input">, "id" | "className" | "required">,
        CommonProps {
    textarea?: false;
}

interface TextareaFieldProps
    extends Omit<ComponentProps<"textarea">, "id" | "className" | "required">,
        CommonProps {
    textarea: true;
}

export type TextInputFieldProps = InputFieldProps | TextareaFieldProps;

const TextInputField = memo(function TextInputField({
                                                        label,
                                                        error,
                                                        icon: Icon,
                                                        textarea = false,
                                                        className,
                                                        required,
                                                        helperText,
                                                        ...props
                                                    }: TextInputFieldProps) {
    const id = useId();
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const hasError = Boolean(error);
    const hasHelper = Boolean(helperText);

    const describedBy =
        [hasError && errorId, hasHelper && helperId].filter(Boolean).join(" ") ||
        undefined;

    const inputClassName = cn(
        "w-full rounded-md border border-input bg-background text-foreground",
        "text-sm placeholder:text-muted-foreground",
        "transition-colors duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "px-3 sm:px-4",
        Icon && "pl-10",
        hasError && "border-destructive focus-visible:ring-destructive",
        className
    );

    const sharedFieldProps = {
        id,
        required,
        "aria-invalid": hasError || undefined,
        "aria-required": required,
        "aria-describedby": describedBy,
    } as const;

    return (
        <Field className="w-full space-y-1.5">
            {label && (
                <FieldLabel
                    htmlFor={id}
                    className={cn(
                        "block text-sm font-medium leading-none",
                        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                        hasError ? "text-destructive" : "text-foreground"
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

            <div className="relative w-full">
                {Icon && (
                    <span
                        className={cn(
                            "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2",
                            "focus:ring-0 focus-visible:ring-0 active:ring-0",
                            hasError ? "text-destructive" : "text-muted-foreground"
                        )}
                        aria-hidden="true"
                    >
            <Icon className="h-4 w-4 shrink-0" />
          </span>
                )}

                {textarea ? (
                    <Textarea
                        {...sharedFieldProps}
                        className={cn(inputClassName, Icon && "pt-2")}
                        {...(props as ComponentProps<"textarea">)}
                    />
                ) : (
                    <Input
                        {...sharedFieldProps}
                        className={inputClassName}
                        {...(props as ComponentProps<"input">)}
                    />
                )}
            </div>

            {hasError && (
                <FieldDescription
                    id={errorId}
                    role="alert"
                    aria-live="polite"
                    className="wrap-break-word text-sm text-destructive"
                >
                    {error}
                </FieldDescription>
            )}

            {hasHelper && !hasError && (
                <FieldDescription
                    id={helperId}
                    className="wrap-break-word text-sm text-muted-foreground"
                >
                    {helperText}
                </FieldDescription>
            )}
        </Field>
    );
});

TextInputField.displayName = "TextInputField";

export { TextInputField };
"use client"

import * as React from "react"
import { useId, useCallback, memo } from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"

type PasswordAutoComplete = "current-password" | "new-password" | "one-time-code"

interface PasswordInputFieldProps
    extends Omit<React.ComponentProps<"input">, "type" | "autoComplete"> {
    label?: string
    error?: string
    description?: string
    icon?: React.ElementType<React.SVGProps<SVGSVGElement>>
    autoComplete?: PasswordAutoComplete
}

const PasswordInputField = memo(
    React.forwardRef<HTMLInputElement, PasswordInputFieldProps>(
        (
            {
                className,
                label,
                error,
                description,
                icon: Icon,
                required,
                disabled,
                id: externalId,
                autoComplete = "current-password",
                ...props
            },
            ref
        ) => {
            const generatedId = useId()
            const id = externalId ?? generatedId
            const errorId = `${id}-error`
            const descriptionId = `${id}-description`

            const [showPassword, setShowPassword] = React.useState(false)

            const togglePasswordVisibility = useCallback(() => {
                setShowPassword((prev) => !prev)
            }, [])

            const hasError = Boolean(error)
            const hasDescription = Boolean(description)

            const ariaDescribedBy =
                [hasError && errorId, hasDescription && descriptionId]
                    .filter(Boolean)
                    .join(" ") || undefined

            return (
                <Field className="w-full space-y-1.5">
                    {label && (
                        <FieldLabel
                            htmlFor={id}
                            className={cn(
                                "text-sm font-medium leading-none",
                                hasError && "text-destructive",
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
                        <FieldDescription id={descriptionId} className="text-xs">
                            {description}
                        </FieldDescription>
                    )}

                    <div className="relative">
                        {Icon && (
                            <span
                                className={cn(
                                    "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
                                    disabled && "opacity-50"
                                )}
                                aria-hidden="true"
                            >
                <Icon className="h-4 w-4" />
              </span>
                        )}

                        <Input
                            ref={ref}
                            id={id}
                            type={showPassword ? "text" : "password"}
                            required={required}
                            disabled={disabled}
                            aria-invalid={hasError || undefined}
                            aria-required={required}
                            aria-describedby={ariaDescribedBy}
                            autoComplete={autoComplete}
                            className={cn(
                                "pr-10",
                                Icon && "pl-10",
                                hasError && "border-destructive focus-visible:ring-destructive",
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
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            )}
                        </Button>
                    </div>

                    {hasError && (
                        <p
                            id={errorId}
                            role="alert"
                            aria-live="polite"
                            className="text-sm font-medium text-destructive"
                        >
                            {error}
                        </p>
                    )}
                </Field>
            )
        }
    )
)

PasswordInputField.displayName = "PasswordInputField"

export { PasswordInputField }
export type { PasswordInputFieldProps }
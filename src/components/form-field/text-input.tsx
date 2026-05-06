"use client"

import * as React from "react"
import {memo, useId} from "react"
import {cn} from "@/lib/utils"
import {Input} from "@/components/ui/input"
import {Textarea} from "@/components/ui/textarea"
import {Field, FieldDescription, FieldLabel} from "@/components/ui/field"

interface CommonProps {
    label?: string
    error?: string
    icon?: React.ElementType<React.SVGProps<SVGSVGElement>>
    required?: boolean
    className?: string
    helperText?: string
}

interface InputFieldProps
    extends Omit<React.ComponentProps<"input">, "id" | "className" | "required">,
        CommonProps {
    textarea?: false
}

interface TextareaFieldProps
    extends Omit<React.ComponentProps<"textarea">, "id" | "className" | "required">,
        CommonProps {
    textarea: true
}

type TextInputFieldProps = InputFieldProps | TextareaFieldProps

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
    const id = useId()
    const errorId = `${id}-error`
    const helperId = `${id}-helper`

    const hasError = Boolean(error)
    const hasHelper = Boolean(helperText)

    const describedBy =
        [hasError && errorId, hasHelper && helperId]
            .filter(Boolean)
            .join(" ") || undefined

    const inputClassName = cn(
        "w-full",
        Icon && "pl-10",
        hasError && "border-destructive focus-visible:ring-destructive",
        className
    )

    return (
        <Field className="w-full space-y-1.5">
            {label && (
                <FieldLabel
                    htmlFor={id}
                    className={cn(
                        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                        hasError && "text-destructive"
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
                            "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
                            hasError && "text-destructive"
                        )}
                        aria-hidden="true"
                    >
            <Icon className="h-4 w-4 shrink-0"/>
          </span>
                )}

                {textarea ? (
                    <Textarea
                        id={id}
                        required={required}
                        aria-invalid={hasError || undefined}
                        aria-required={required}
                        aria-describedby={describedBy}
                        className={cn(inputClassName, Icon && "pt-2")}
                        {...(props as React.ComponentProps<"textarea">)}
                    />
                ) : (
                    <Input
                        id={id}
                        required={required}
                        aria-invalid={hasError || undefined}
                        aria-required={required}
                        aria-describedby={describedBy}
                        className={inputClassName}
                        {...(props as React.ComponentProps<"input">)}
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
    )
})

TextInputField.displayName = "TextInputField"

export {TextInputField}
export type {TextInputFieldProps}
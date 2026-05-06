'use client'

import {type ReactNode, useCallback, useId, useMemo} from 'react'
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Field, FieldDescription, FieldLabel} from '@/components/ui/field'
import {cn} from '@/lib/utils'

export type SelectValueType = string | number

export interface Option<T extends SelectValueType = SelectValueType> {
    readonly value: T
    readonly label: string
    readonly disabled?: boolean
}

export interface SelectInputFieldProps<T extends SelectValueType = SelectValueType> {
    readonly options: readonly Option<T>[]
    readonly onValueChange: (value: T) => void | Promise<void>
    readonly placeholder: string
    readonly label?: string
    readonly value?: T
    readonly error?: string
    readonly helperText?: string
    readonly className?: string
    readonly required?: boolean
    readonly disabled?: boolean
}

type SelectInputFieldComponent = {
    <T extends SelectValueType = string>(props: SelectInputFieldProps<T>): ReactNode
    displayName: string
}

const capitalize = (str: string): string =>
    str.length === 0 ? str : str.charAt(0).toUpperCase() + str.slice(1)

const SelectInputField: SelectInputFieldComponent = function SelectInputField<
    T extends SelectValueType = string,
>({
      options,
      onValueChange,
      placeholder,
      label,
      value,
      error,
      helperText,
      className,
      required = false,
      disabled = false,
  }: SelectInputFieldProps<T>): ReactNode {
    const fieldId = useId()
    const errorId = useId()
    const helperId = useId()

    const hasError = Boolean(error)

    const stringValue = useMemo(
        (): string => (value !== undefined ? String(value) : ''),
        [value],
    )

    const sanitizedOptions = useMemo((): readonly Option<T>[] => {
        const seen = new Set<string>()
        return options.reduce<Option<T>[]>((acc, option) => {
            if (option.value === undefined || option.value === null) return acc
            const key = String(option.value)
            if (seen.has(key)) return acc
            seen.add(key)
            acc.push(option)
            return acc
        }, [])
    }, [options])

    const handleValueChange = useCallback(
        (selected: string | null): void => {
            if (selected === null) return
            const match = sanitizedOptions.find((o) => String(o.value) === selected)
            if (match) void onValueChange(match.value)
        },
        [sanitizedOptions, onValueChange],
    )

    const describedBy = useMemo((): string | undefined => {
        const ids: string[] = []
        if (hasError) ids.push(errorId)
        if (helperText) ids.push(helperId)
        return ids.length > 0 ? ids.join(' ') : undefined
    }, [hasError, errorId, helperText, helperId])

    return (
        <Field className="w-full space-y-1.5">
            {label && (
                <FieldLabel
                    htmlFor={fieldId}
                    className={cn(
                        'text-sm font-medium leading-none',
                        hasError && 'text-destructive',
                        disabled && 'cursor-not-allowed opacity-50',
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

            <Select value={stringValue} onValueChange={handleValueChange} disabled={disabled}>
                <SelectTrigger
                    id={fieldId}
                    aria-label={label ?? placeholder}
                    aria-required={required}
                    aria-invalid={hasError}
                    aria-describedby={describedBy}
                    className={cn(
                        'w-full',
                        hasError && 'border-destructive focus-visible:ring-destructive/50',
                        className,
                    )}
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>

                <SelectContent>
                    <SelectGroup aria-label={label}>
                        {sanitizedOptions.map(({value: optValue, label: optLabel, disabled: optDisabled}) => (
                            <SelectItem
                                key={String(optValue)}
                                value={String(optValue)}
                                disabled={optDisabled}
                            >
                                {capitalize(optLabel)}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>

            {hasError && (
                <FieldDescription
                    id={errorId}
                    role="alert"
                    aria-live="polite"
                    className="text-sm font-medium text-destructive"
                >
                    {error}
                </FieldDescription>
            )}

            {helperText && !hasError && (
                <FieldDescription id={helperId} className="text-sm text-muted-foreground">
                    {helperText}
                </FieldDescription>
            )}
        </Field>
    )
}

SelectInputField.displayName = 'SelectInputField'

export default SelectInputField
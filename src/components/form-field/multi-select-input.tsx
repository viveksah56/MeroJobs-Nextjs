"use client"

import * as React from "react"
import {useCallback, useEffect, useId, useMemo, useRef, useState} from "react"
import {Check, ChevronDown, Plus, Search, X} from "lucide-react"
import {cn} from "@/lib/utils"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Field, FieldDescription, FieldLabel} from "@/components/ui/field"

type SelectValue = string | number

interface MultiSelectOption<T extends SelectValue = SelectValue> {
    value: T
    label: string
    disabled?: boolean
}

interface MultiSelectFieldProps<T extends SelectValue = SelectValue> {
    label?: string
    placeholder?: string
    options: MultiSelectOption<T>[]
    value?: T[]
    defaultValue?: T[]
    onValueChange?: (value: T[]) => void
    error?: string
    required?: boolean
    disabled?: boolean
    maxSelected?: number
    className?: string
    searchable?: boolean
    clearable?: boolean
    emptyMessage?: string
    searchPlaceholder?: string
    onAddClickAction?: () => void
}

function MultiSelectField<T extends SelectValue = SelectValue>({
                                                                   label,
                                                                   placeholder = "Select items...",
                                                                   options,
                                                                   value,
                                                                   defaultValue = [],
                                                                   onValueChange,
                                                                   error,
                                                                   required = false,
                                                                   disabled = false,
                                                                   maxSelected,
                                                                   className,
                                                                   searchable = true,
                                                                   clearable = true,
                                                                   emptyMessage = "No items found.",
                                                                   searchPlaceholder = "Search...",
                                                                   onAddClickAction,
                                                               }: MultiSelectFieldProps<T>) {
    const id = useId()
    const errorId = `${id}-error`

    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [internalValue, setInternalValue] = useState<T[]>(defaultValue)

    const dropdownRef = useRef<HTMLDivElement>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)

    const selectedValues = value ?? internalValue

    const hasError = Boolean(error)
    const hasSelection = selectedValues.length > 0
    const isMaxSelected = maxSelected ? selectedValues.length >= maxSelected : false

    const handleValueChange = useCallback(
        (next: T[]) => {
            if (value === undefined) setInternalValue(next)
            onValueChange?.(next)
        },
        [value, onValueChange]
    )

    const toggleSelection = useCallback(
        (optionValue: T) => {
            if (disabled) return
            const isSelected = selectedValues.includes(optionValue)
            if (!isSelected && maxSelected && selectedValues.length >= maxSelected) return
            handleValueChange(
                isSelected
                    ? selectedValues.filter((v) => v !== optionValue)
                    : [...selectedValues, optionValue]
            )
        },
        [selectedValues, disabled, maxSelected, handleValueChange]
    )

    const removeSelection = useCallback(
        (optionValue: T) => {
            if (disabled) return
            handleValueChange(selectedValues.filter((v) => v !== optionValue))
        },
        [selectedValues, disabled, handleValueChange]
    )

    const clearAll = useCallback(() => {
        if (!disabled) handleValueChange([])
    }, [disabled, handleValueChange])

    const filteredOptions = useMemo(() => {
        if (!search || !searchable) return options
        const lower = search.toLowerCase()
        return options.filter((o) => o.label.toLowerCase().includes(lower))
    }, [options, search, searchable])

    const selectedOptions = useMemo(
        () =>
            selectedValues
                .map((v) => options.find((o) => o.value === v))
                .filter((o): o is MultiSelectOption<T> => Boolean(o)),
        [selectedValues, options]
    )

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        if (open) {
            document.addEventListener("mousedown", handler)
            return () => document.removeEventListener("mousedown", handler)
        }
    }, [open])

    useEffect(() => {
        if (open && searchable) {
            const frame = requestAnimationFrame(() => searchInputRef.current?.focus())
            return () => cancelAnimationFrame(frame)
        }
    }, [open, searchable])

    return (
        <Field ref={dropdownRef} className={cn("w-full space-y-1.5", className)}>
            {label && (
                <FieldLabel
                    htmlFor={id}
                    className={cn(
                        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
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

            <div className="relative">
                <Button
                    id={id}
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-haspopup="listbox"
                    aria-invalid={hasError || undefined}
                    aria-required={required}
                    aria-describedby={hasError ? errorId : undefined}
                    disabled={disabled}
                    onClick={() => !disabled && setOpen((p) => !p)}
                    className={cn(
                        "h-auto min-h-9 w-full justify-start px-2 py-2 text-left font-normal sm:px-3",
                        hasError && "border-destructive focus-visible:ring-destructive",
                        !hasSelection && "text-muted-foreground"
                    )}
                >
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1 sm:gap-1.5">
                        {hasSelection ? (
                            selectedOptions.map((option) => (
                                <Badge
                                    key={String(option.value)}
                                    variant="secondary"
                                    className="flex h-5 shrink-0 items-center gap-0.5 border-0 bg-primary/10 px-1.5 text-xs text-primary hover:bg-primary/20 sm:h-6 sm:gap-1 sm:px-2"
                                >
                  <span className="max-w-16 truncate sm:max-w-24 md:max-w-32 lg:max-w-40">
                    {option.label}
                  </span>
                                    {clearable && !disabled && (
                                        <button
                                            type="button"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                removeSelection(option.value)
                                            }}
                                            aria-label={`Remove ${option.label}`}
                                            className="rounded-sm p-0.5 opacity-70 transition-all hover:bg-primary/20 hover:opacity-100"
                                        >
                                            <X className="h-3 w-3" aria-hidden="true"/>
                                        </button>
                                    )}
                                </Badge>
                            ))
                        ) : (
                            <span className="truncate text-xs sm:text-sm">{placeholder}</span>
                        )}
                    </div>

                    <div className="ml-1 flex shrink-0 items-center gap-0.5 sm:ml-2 sm:gap-1">
                        {clearable && hasSelection && !disabled && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    clearAll()
                                }}
                                aria-label="Clear all selections"
                                className="flex h-5 w-5 items-center justify-center rounded-sm opacity-50 transition-all hover:bg-muted hover:opacity-100 sm:h-6 sm:w-6"
                            >
                                <X className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true"/>
                            </button>
                        )}
                        <ChevronDown
                            className={cn(
                                "h-4 w-4 opacity-50 transition-transform duration-200",
                                open && "rotate-180"
                            )}
                            aria-hidden="true"
                        />
                    </div>
                </Button>

                {open && (
                    <div
                        role="listbox"
                        aria-multiselectable="true"
                        aria-label={label}
                        className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border bg-popover shadow-lg"
                    >
                        {searchable && (
                            <div className="border-b bg-muted/30 p-2 sm:p-3">
                                <div className="relative">
                                    <Search
                                        className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground sm:left-3 sm:h-4 sm:w-4"
                                        aria-hidden="true"
                                    />
                                    <Input
                                        ref={searchInputRef}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder={searchPlaceholder}
                                        className="h-8 bg-background pl-8 text-xs sm:h-9 sm:pl-9 sm:text-sm"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="max-h-40 overflow-auto overscroll-contain sm:max-h-52 md:max-h-64">
                            {filteredOptions.length === 0 ? (
                                <div
                                    className="flex flex-col items-center gap-2 px-3 py-4 text-center text-xs text-muted-foreground sm:py-6 sm:text-sm">
                                    <span>{emptyMessage}</span>
                                    {onAddClickAction && (
                                        <div className="flex flex-col items-center justify-center">
                                            <div
                                                className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted sm:mb-3 sm:h-16 sm:w-16">
                                                <Plus
                                                    className="h-6 w-6 text-muted-foreground sm:h-8 sm:w-8"
                                                    aria-hidden="true"
                                                />
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onAddClickAction()
                                                }}
                                            >
                                                Add {label ?? "Item"}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-1">
                                    {filteredOptions.map((option) => {
                                        const isSelected = selectedValues.includes(option.value)
                                        const isDisabled =
                                            option.disabled || (isMaxSelected && !isSelected) || disabled

                                        return (
                                            <button
                                                key={String(option.value)}
                                                type="button"
                                                role="option"
                                                aria-selected={isSelected}
                                                disabled={isDisabled}
                                                onClick={() => toggleSelection(option.value)}
                                                className={cn(
                                                    "my-0.5 flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-xs transition-colors",
                                                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                                                    "sm:px-3 sm:py-2.5 sm:text-sm",
                                                    isSelected
                                                        ? "bg-primary text-primary-foreground"
                                                        : "hover:bg-muted",
                                                    isDisabled && "cursor-not-allowed opacity-50"
                                                )}
                                            >
                                                <span className="flex-1 truncate pr-2">{option.label}</span>
                                                {isSelected && (
                                                    <Check
                                                        className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4"
                                                        aria-hidden="true"
                                                    />
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
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

            {maxSelected && (
                <FieldDescription className="text-xs text-muted-foreground">
                    {selectedValues.length} of {maxSelected} selected
                </FieldDescription>
            )}
        </Field>
    )
}

MultiSelectField.displayName = "MultiSelectField"

export {MultiSelectField}
export type {MultiSelectFieldProps, MultiSelectOption, SelectValue}
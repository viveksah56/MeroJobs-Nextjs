export type FormatDateInput = Date | string | number | null | undefined

const toDate = (value: FormatDateInput): Date | null => {
    if (!value && value !== 0) return null
    const date = value instanceof Date ? value : new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
}

export const formatDate = (value: FormatDateInput): string => {
    const date = toDate(value)
    return date ? date.toISOString().split("T")[0] : ""
}

export const formatDateTime = (value: FormatDateInput): string => {
    const date = toDate(value)
    return date ? date.toLocaleString() : ""
}

export const formatSalary = (
    value: number,
    currency = "USD",
    locale = "en-US",
): string => {
    if (!Number.isFinite(value)) return ""
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(value)
}
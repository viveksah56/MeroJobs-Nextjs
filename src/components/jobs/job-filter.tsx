"use client"

import { memo, useCallback, useOptimistic, useTransition } from "react"
import { Minus, Plus, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface FilterState {
    jobTypes: string[]
    experience: string[]
    workTypes: string[]
    lastUpdated: string
    aiMatch: boolean
}

interface JobFilterProps {
    value: FilterState
    onChange: (next: FilterState) => void
    onMatchMe?: () => void
    className?: string
}

interface FilterSectionProps {
    title: string
    children: React.ReactNode
}

interface CheckboxGridProps {
    options: readonly string[]
    selected: string[]
    onToggle: (value: string) => void
}

const JOB_TYPES    = ["Full-time", "Part-time", "Freelance", "Contract", "Internship"] as const
const EXPERIENCE   = ["Entry Level", "Mid Level", "Senior Level", "Lead / Manager"] as const
const WORK_TYPES   = ["Remote", "Hybrid", "On-site"] as const
const LAST_UPDATED = ["24 hours ago", "3 days ago", "7 days ago", "30 days ago"] as const

const DEFAULT_FILTER: FilterState = {
    jobTypes: [],
    experience: [],
    workTypes: [],
    lastUpdated: "30 days ago",
    aiMatch: false,
}

function toggleItem(arr: string[], item: string): string[] {
    return arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item]
}

function toCheckboxId(option: string): string {
    return `filter-${option.toLowerCase().replace(/[\s/]+/g, "-")}`
}

const FilterSection = memo(function FilterSection({ title, children }: FilterSectionProps) {
    return (
        <Collapsible defaultOpen>
            <div className="border-b border-border/60 pb-5">
                <CollapsibleTrigger className="group flex w-full items-center justify-between py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                    <span className="text-base font-semibold">{title}</span>
                    <Plus className="size-4 text-muted-foreground group-data-[state=open]:hidden" aria-hidden="true" />
                    <Minus className="size-4 text-muted-foreground hidden group-data-[state=open]:block" aria-hidden="true" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="mt-4">{children}</div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    )
})

const CheckboxGrid = memo(function CheckboxGrid({ options, selected, onToggle }: CheckboxGridProps) {
    return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {options.map((option) => {
                const checked = selected.includes(option)
                const id = toCheckboxId(option)
                return (
                    <label
                        key={id}
                        htmlFor={id}
                        className={cn(
                            "flex cursor-pointer select-none items-center gap-2.5 text-sm",
                            checked ? "font-medium text-foreground" : "text-muted-foreground",
                        )}
                    >
                        <Checkbox
                            id={id}
                            checked={checked}
                            onCheckedChange={() => onToggle(option)}
                            className={cn(
                                "rounded border-black/60",
                                "data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600",
                            )}
                        />
                        {option}
                    </label>
                )
            })}
        </div>
    )
})

const JobFilter = memo(function JobFilter({ value, onChange, onMatchMe, className }: JobFilterProps) {
    const [isPending, startTransition] = useTransition()
    const [optimistic, setOptimistic] = useOptimistic(value)

    const commit = useCallback(
        (patch: Partial<FilterState>) => {
            const next = { ...value, ...patch }
            setOptimistic(next)
            startTransition(() => onChange(next))
        },
        [value, onChange, setOptimistic],
    )

    const toggleJobType    = useCallback((v: string) => commit({ jobTypes:   toggleItem(optimistic.jobTypes,   v) }), [optimistic.jobTypes,   commit])
    const toggleExperience = useCallback((v: string) => commit({ experience: toggleItem(optimistic.experience, v) }), [optimistic.experience, commit])
    const toggleWorkType   = useCallback((v: string) => commit({ workTypes:  toggleItem(optimistic.workTypes,  v) }), [optimistic.workTypes,  commit])

    const handleClear = useCallback(() => commit(DEFAULT_FILTER), [commit])

    const hasActiveFilters =
        optimistic.jobTypes.length > 0 ||
        optimistic.experience.length > 0 ||
        optimistic.workTypes.length > 0 ||
        optimistic.aiMatch

    return (
        <aside
            aria-label="Job filters"
            aria-busy={isPending}
            className={cn(
                "w-full rounded-2xl border border-border/60 bg-white p-5 shadow-sm",
                "transition-opacity duration-150",
                "sm:max-w-xs",
                isPending && "pointer-events-none opacity-60",
                className,
            )}
        >
            <div className="flex items-center justify-between pb-4">
                <h2 className="text-lg font-bold">Filter</h2>
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="rounded text-sm font-medium text-red-500 transition-colors hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                        aria-label="Clear all filters"
                    >
                        Clear filter
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-5">
                <FilterSection title="Job type">
                    <CheckboxGrid options={JOB_TYPES} selected={optimistic.jobTypes} onToggle={toggleJobType} />
                </FilterSection>

                <FilterSection title="Experience">
                    <CheckboxGrid options={EXPERIENCE} selected={optimistic.experience} onToggle={toggleExperience} />
                </FilterSection>

                <FilterSection title="Work type">
                    <CheckboxGrid options={WORK_TYPES} selected={optimistic.workTypes} onToggle={toggleWorkType} />
                </FilterSection>

                <div className="flex flex-col gap-3 border-b border-border/60 pb-5">
                    <span id="last-updated-label" className="text-base font-semibold">
                        Last updated
                    </span>
                    <Select
                        value={optimistic.lastUpdated}
                        onValueChange={(v) => v && commit({ lastUpdated: v })}
                    >
                        <SelectTrigger
                            className="w-full rounded-xl border-border/60 bg-white text-sm"
                            aria-labelledby="last-updated-label"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {LAST_UPDATED.map((opt) => (
                                <SelectItem key={opt} value={opt} className="text-sm">
                                    {opt}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2" aria-hidden="true">
                        <Sparkles className="size-5 text-blue-600" />
                        <span className="text-base font-semibold">Use AI smart match</span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        Let AI recommend roles based on your skills and past experience.
                    </p>
                    <Button
                        type="button"
                        onClick={onMatchMe}
                        className={cn(
                            "w-full rounded-xl bg-blue-600 py-5 text-sm font-semibold text-white",
                            "transition-colors hover:bg-blue-700 active:bg-blue-800",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                        )}
                    >
                        Match me
                    </Button>
                </div>
            </div>
        </aside>
    )
})

export default JobFilter
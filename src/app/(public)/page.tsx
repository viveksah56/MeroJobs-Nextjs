"use client"

import { useState } from "react"

import ActionSearch from "@/components/action-search"
import { JobCardGrid } from "@/components/jobs/jobs-card"
import JobFilter, { type FilterState } from "@/components/jobs/job-filter"
import { jobResponse } from "@/data/job"

const DEFAULT_FILTERS: FilterState = {
    jobTypes: [],
    experience: [],
    workTypes: [],
    lastUpdated: "30 days ago",
    aiMatch: false,
}

export default function Home() {
    const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)

    const filtered = jobResponse.filter((job) => {
        if (filters.jobTypes.length > 0 && !filters.jobTypes.includes(job.employmentType)) return false
        return true;
    })

    return (
        <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold sm:text-4xl">Welcome to Nexus</h1>
                    <p className="text-lg text-muted-foreground">
                        Please{" "}
                        <a
                            href="/login"
                            className="text-primary underline underline-offset-4 transition-opacity hover:opacity-80"
                        >
                            sign in
                        </a>{" "}
                        to access your workspace.
                    </p>
                </div>

                <ActionSearch />

                <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                    <div className="w-full shrink-0 lg:w-72 xl:w-80">
                        <div className="lg:sticky lg:top-6">
                            <JobFilter
                                value={filters}
                                onChange={setFilters}
                                onMatchMe={() => console.log("AI match triggered")}
                            />
                        </div>
                    </div>

                    <div className="min-w-0 flex-1">
                        {filtered.length > 0 ? (
                            <JobCardGrid jobs={filtered} />
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
                                <p className="text-base font-medium text-foreground">No jobs match your filters</p>
                                <p className="mt-1 text-sm text-muted-foreground">Try adjusting or clearing your filters</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}

"use client"

import Image from "next/image"
import Script from "next/script"
import { memo, useCallback, useOptimistic, useState } from "react"
import { Bookmark, Briefcase, Heart, MapPin, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface Job {
    id: string
    title: string
    company: string
    companyLogo: string
    companyVerified?: boolean
    employmentType: string
    location: string
    description: string
    salaryMin: number
    salaryMax: number
    currency?: string
    salaryPeriod?: string
    postedAgo: string
    aiMatchScore?: number
    skills?: string[]
    applyUrl: string
}

interface JobCardProps {
    job: Job
    priority?: boolean
    className?: string
}

interface JobCardGridProps {
    jobs: Job[]
    className?: string
}

const formatSalary = (min: number, max: number, currency = "USD", period = "month"): string => {
    const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : String(n))
    return `${currency} ${fmt(min)} – ${fmt(max)}/${period}`
}

const buildJsonLd = (job: Job) => ({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    hiringOrganization: {
        "@type": "Organization",
        name: job.company,
        logo: job.companyLogo,
    },
    jobLocation: {
        "@type": "Place",
        address: { "@type": "PostalAddress", addressLocality: job.location },
    },
    employmentType: job.employmentType.toUpperCase().replace(/\s+/g, "_"),
    baseSalary: {
        "@type": "MonetaryAmount",
        currency: job.currency ?? "USD",
        value: {
            "@type": "QuantitativeValue",
            minValue: job.salaryMin,
            maxValue: job.salaryMax,
            unitText: "MONTH",
        },
    },
    url: job.applyUrl,
})

const JobCard = memo(function JobCard({ job, priority = false, className }: JobCardProps) {
    const [saved, setSaved] = useState(false)
    const [liked, setLiked] = useState(false)

    const [optimisticSaved, setOptimisticSaved] = useOptimistic(saved)
    const [optimisticLiked, setOptimisticLiked] = useOptimistic(liked)

    const handleSave = useCallback(() => {
        setOptimisticSaved((prev) => !prev)
        setSaved((prev) => !prev)
    }, [setOptimisticSaved])

    const handleLike = useCallback(() => {
        setOptimisticLiked((prev) => !prev)
        setLiked((prev) => !prev)
    }, [setOptimisticLiked])

    const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency, job.salaryPeriod)

    return (
        <>
            <Script
                id={`job-ld-${job.id}`}
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(job)) }}
            />

            <Card
                className={cn(
                    "group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm",
                    "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md",
                    "py-3",
                    className,
                )}
                aria-label={`${job.title} at ${job.company}`}
            >
                <CardContent className="flex flex-col gap-0 p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-3.5">
                        <div className="relative size-11 sm:size-14 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted">
                            <Image
                                src={job.companyLogo}
                                alt={`${job.company} logo`}
                                fill
                                sizes="(max-width: 640px) 44px, 56px"
                                className="object-contain p-2"
                                priority={priority}
                            />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="flex items-center gap-1 truncate text-sm text-muted-foreground">
                                {job.company}
                                {job.companyVerified && (
                                    <span
                                        aria-label="Verified company"
                                        className="inline-flex size-4 items-center justify-center rounded-full bg-blue-500 text-white"
                                    >
                                        <svg viewBox="0 0 12 12" fill="none" className="size-2.5" aria-hidden="true">
                                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                )}
                            </p>
                            <h2 className="mt-0.5 line-clamp-1 text-base font-bold leading-tight sm:text-lg group-hover:text-primary transition-colors">
                                {job.title}
                            </h2>
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleSave}
                                aria-label={optimisticSaved ? `Unsave ${job.title}` : `Save ${job.title}`}
                                aria-pressed={optimisticSaved}
                                className={cn(
                                    "size-8 sm:size-9 rounded-xl border-border/60",
                                    "text-muted-foreground transition-colors",
                                    "hover:text-yellow-500 hover:bg-yellow-50",
                                    optimisticSaved && "text-yellow-500 bg-yellow-50 hover:bg-yellow-100",
                                )}
                            >
                                <Bookmark className={cn("size-4", optimisticSaved && "fill-current")} aria-hidden="true" />
                            </Button>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleLike}
                                aria-label={optimisticLiked ? `Unlike ${job.title}` : `Like ${job.title}`}
                                aria-pressed={optimisticLiked}
                                className={cn(
                                    "size-8 sm:size-9 rounded-xl border-border/60",
                                    "text-muted-foreground transition-colors",
                                    "hover:text-red-500 hover:bg-red-50",
                                    optimisticLiked && "text-red-500 bg-red-50 hover:bg-red-100",
                                )}
                            >
                                <Heart className={cn("size-4", optimisticLiked && "fill-current")} aria-hidden="true" />
                            </Button>
                        </div>
                    </div>

                    <div
                        className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground"
                        aria-label="Job details"
                    >
                        <span className="flex items-center gap-1.5">
                            <Briefcase className="size-3.5 shrink-0" aria-hidden="true" />
                            {job.employmentType}
                        </span>
                        <span aria-hidden="true" className="select-none text-border">·</span>
                        <span className="flex items-center gap-1.5 min-w-0">
                            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                            <span className="truncate">{job.location}</span>
                        </span>
                    </div>

                    <div className="my-3.5 border-t border-border/50" aria-hidden="true" />

                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {job.description}
                    </p>

                    {job.skills && job.skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Required skills">
                            {job.skills.slice(0, 4).map((skill) => (
                                <Badge key={skill} variant="outline" className="rounded-full px-2.5 py-0.5 text-xs">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    )}

                    <div className="my-3.5 border-t border-border/50" aria-hidden="true" />

                    <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">
                            <span className="sr-only">Salary: </span>
                            {salary}
                        </p>
                        <time className="shrink-0 text-xs text-muted-foreground" aria-label={`Posted ${job.postedAgo}`}>
                            {job.postedAgo}
                        </time>
                    </div>

                    {job.aiMatchScore !== undefined && (
                        <a
                            href={job.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Apply — ${job.aiMatchScore}% AI match`}
                            className={cn(
                                "mt-3.5 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5",
                                "border border-indigo-100 bg-indigo-50 text-sm font-medium text-indigo-600",
                                "transition-colors hover:bg-indigo-100",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                                "dark:border-indigo-800/50 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-900/50",
                            )}
                        >
                            <Sparkles className="size-4 shrink-0" aria-hidden="true" />
                            AI Match: {job.aiMatchScore}% Match
                        </a>
                    )}
                </CardContent>
            </Card>
        </>
    )
})

export const JobCardGrid = memo(function JobCardGrid({ jobs, className }: JobCardGridProps) {
    return (
        <section
            aria-label="Job listings"
            className={cn(
                "grid grid-cols-1 gap-4",
                "sm:grid-cols-2",
                "xl:grid-cols-3",
                className,
            )}
        >
            {jobs.map((job, i) => (
                <JobCard key={job.id} job={job} priority={i < 3} />
            ))}
        </section>
    )
})

export default JobCard
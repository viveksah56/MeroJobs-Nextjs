export interface Job {
    id: string
    title: string
    company: string
    companyLogo: string
    companyVerified?: boolean
    employmentType: string
    workType?: string
    experienceLevel?: string
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

export const jobResponse: Job[] = [
    {
        id: "1",
        title: "Frontend Developer",
        company: "TechNova",
        companyLogo: "/companies/technova.png",
        companyVerified: true,
        employmentType: "Full Time",
        location: "Kathmandu, Nepal",
        description:
            "We are looking for a skilled Frontend Developer with experience in React, Next.js, and Tailwind CSS.",
        salaryMin: 800,
        salaryMax: 1500,
        currency: "USD",
        salaryPeriod: "month",
        postedAgo: "2 days ago",
        aiMatchScore: 92,
        skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
        applyUrl: "https://example.com/jobs/frontend-developer",
    },
    {
        id: "2",
        title: "Backend Engineer",
        company: "CodeCraft",
        companyLogo: "/companies/codecraft.png",
        companyVerified: true,
        employmentType: "Remote",
        location: "Pokhara, Nepal",
        description:
            "Join our backend team to build scalable APIs using Spring Boot and PostgreSQL.",
        salaryMin: 1200,
        salaryMax: 2200,
        currency: "USD",
        salaryPeriod: "month",
        postedAgo: "5 hours ago",
        aiMatchScore: 88,
        skills: ["Java", "Spring Boot", "PostgreSQL", "Docker"],
        applyUrl: "https://example.com/jobs/backend-engineer",
    },
    {
        id: "3",
        title: "UI/UX Designer",
        company: "Pixel Studio",
        companyLogo: "/companies/pixelstudio.png",
        companyVerified: false,
        employmentType: "Contract",
        location: "Lalitpur, Nepal",
        description:
            "Design intuitive and modern user interfaces for web and mobile products.",
        salaryMin: 600,
        salaryMax: 1200,
        currency: "USD",
        salaryPeriod: "month",
        postedAgo: "1 week ago",
        aiMatchScore: 80,
        skills: ["Figma", "Adobe XD", "Wireframing", "Prototyping"],
        applyUrl: "https://example.com/jobs/uiux-designer",
    },
    {
        id: "4",
        title: "DevOps Engineer",
        company: "CloudSync",
        companyLogo: "/companies/cloudsync.png",
        companyVerified: true,
        employmentType: "Full Time",
        location: "Remote",
        description:
            "Seeking a DevOps Engineer experienced with AWS, CI/CD pipelines, and Kubernetes.",
        salaryMin: 1500,
        salaryMax: 3000,
        currency: "USD",
        salaryPeriod: "month",
        postedAgo: "3 days ago",
        aiMatchScore: 95,
        skills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
        applyUrl: "https://example.com/jobs/devops-engineer",
    },
]

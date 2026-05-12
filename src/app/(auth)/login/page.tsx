import type { Metadata } from "next"
import { LoginForm } from "@/views/auth/login-form"

export const metadata: Metadata = {
    title: "Sign In | Mero Jobs",
    description: "Sign in to your  account to manage your team, track performance, and access your workspace.",
    keywords: ["login", "sign in", "nexus", "employee portal", "workspace"],
    robots: { index: false, follow: false, nocache: true },
    openGraph: {
        title: "Sign In | Nexus",
        description: "Access your Nexus workspace securely.",
        type: "website",
        siteName: "Nexus",
    },
    twitter: {
        card: "summary",
        title: "Sign In | Nexus",
        description: "Access your Nexus workspace securely.",
    },
    alternates: { canonical: "/login" },
}

export default function LoginPage() {
    return <LoginForm />
}
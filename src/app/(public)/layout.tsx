import NavigationBar from "@/components/headers/nav-bar";

export default function PublicLayout({children}: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
            <NavigationBar />
            {children}
        </div>
    )
}
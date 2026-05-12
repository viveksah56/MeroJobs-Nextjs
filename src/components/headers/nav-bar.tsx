"use client";

import { memo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, Menu, X } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

const NAV_ITEMS = [
    { name: "Jobs", href: "#jobs" },
    { name: "Employers", href: "#employers" },
    { name: "Industries", href: "#industries" },
    { name: "App", href: "#app" },
] as const;

type NavItem = (typeof NAV_ITEMS)[number];

const NavLink = memo(({ href, name }: NavItem) => (
    <Link
        href={href}
        className="text-sm font-medium text-foreground/70 transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm px-1"
    >
        {name}
    </Link>
));
NavLink.displayName = "NavLink";

const MobileNavLink = memo(({ href, name, onClick }: NavItem & { onClick: () => void }) => (
    <Link
        href={href}
        onClick={onClick}
        className={cn(
            "flex items-center rounded-md px-3 py-2.5 text-sm font-medium",
            "text-foreground/80 transition-colors duration-150",
            "hover:bg-accent hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
    >
        {name}
    </Link>
));
MobileNavLink.displayName = "MobileNavLink";

function NavigationBar() {
    const [sheetOpen, setSheetOpen] = useState(false);
    const closeSheet = useCallback(() => setSheetOpen(false), []);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                <Link
                    href="/"
                    className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md shrink-0"
                    aria-label="Merojob home"
                >
                    <span className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-lg bg-primary text-primary-foreground shrink-0">
                        <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                    </span>
                    <span className="text-lg sm:text-xl font-bold tracking-tight select-none">
                        Merojob
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-6 lg:gap-8" aria-label="Primary navigation">
                    {NAV_ITEMS.map((item) => (
                        <NavLink key={item.name} {...item} />
                    ))}
                </nav>

                <div className="flex items-center gap-1 sm:gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="hidden sm:inline-flex rounded-full text-sm font-medium"
                    >
                        Sign in
                    </Button>
                    <Button
                        size="sm"
                        className="rounded-full bg-foreground text-background hover:bg-foreground/90 text-xs sm:text-sm px-3 sm:px-4 font-medium"
                    >
                        Post a Job
                    </Button>

                    <div className="hidden md:flex items-center gap-2">
                        <Separator orientation="vertical" className="h-5 mx-1" />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full gap-1.5 text-sm font-medium"
                        >
                            For Employers
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Button>
                    </div>

                    <div className="md:hidden">
                        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                            <SheetTrigger>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full h-8 w-8 sm:h-9 sm:w-9"
                                    aria-label={sheetOpen ? "Close menu" : "Open menu"}
                                >
                                    {sheetOpen ? (
                                        <X className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                                    ) : (
                                        <Menu className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                                    )}
                                </Button>
                            </SheetTrigger>

                            <SheetContent
                                side="right"
                                className="w-[280px] sm:w-80 flex flex-col gap-0 p-0"
                            >
                                <SheetHeader className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-border">
                                    <SheetTitle className="flex items-center gap-2 text-left">
                                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shrink-0">
                                            <Briefcase className="h-4 w-4" aria-hidden="true" />
                                        </span>
                                        <span className="font-bold tracking-tight">Merojob</span>
                                    </SheetTitle>
                                </SheetHeader>

                                <nav
                                    className="flex flex-col px-3 sm:px-4 py-3 sm:py-4 gap-0.5"
                                    aria-label="Mobile navigation"
                                >
                                    {NAV_ITEMS.map((item) => (
                                        <MobileNavLink
                                            key={item.name}
                                            {...item}
                                            onClick={closeSheet}
                                        />
                                    ))}
                                </nav>

                                <Separator />

                                <div className="flex flex-col gap-2 px-5 sm:px-6 py-4 sm:py-5 mt-auto">
                                    <Button
                                        variant="outline"
                                        className="w-full rounded-full text-sm font-medium"
                                        onClick={closeSheet}
                                    >
                                        Sign in
                                    </Button>
                                    <Button
                                        className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90 text-sm font-medium"
                                        onClick={closeSheet}
                                    >
                                        Post a Job
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full rounded-full gap-1.5 text-sm font-medium"
                                        onClick={closeSheet}
                                    >
                                        For Employers
                                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                    </Button>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default memo(NavigationBar);
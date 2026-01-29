"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Home, Users, CalendarCheck, Banknote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/students", label: "Students", icon: Users },
    { href: "/attendance", label: "Attendance", icon: CalendarCheck },
    { href: "/fees", label: "Fees", icon: Banknote },
]

export function MobileHeader() {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 md:hidden"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col">
                    <SheetTitle>Menu</SheetTitle>
                    <nav className="grid gap-2 text-lg font-medium mt-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-lg font-semibold mb-4"
                            onClick={() => setOpen(false)}
                        >
                            <span className="">Academy Manager</span>
                        </Link>
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                        "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground",
                                        isActive
                                            ? "bg-muted text-foreground"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>
                </SheetContent>
            </Sheet>
            <div className="w-full flex-1">
                <span className="font-semibold">Academy Manager</span>
            </div>
        </header>
    )
}

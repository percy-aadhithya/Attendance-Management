"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, CalendarCheck, Home, Banknote, Menu, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/students", label: "Students", icon: Users },
    { href: "/attendance", label: "Attendance", icon: CalendarCheck },
    { href: "/fees", label: "Fees", icon: Banknote },
    { href: "/reports", label: "Reports", icon: FileText },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="hidden border-r bg-muted/40 md:block min-h-screen w-[220px] lg:w-[280px]">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <span className="">Academy Manager</span>
                    </Link>
                </div>
                <div className="flex-1">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                        isActive
                                            ? "bg-muted text-primary"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </div>
        </div>
    )
}

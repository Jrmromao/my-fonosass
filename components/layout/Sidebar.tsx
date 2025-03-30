'use client'
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, ListTodo, LogOut, Menu, Plane, Map, Calendar, Settings, X } from "lucide-react"
import { useClerk, UserButton, useUser } from "@clerk/nextjs"

// Updated sidebar items for TripPlan AI
const sidebarItems = [
    {
        title: "Dashboard",
        icon: Home,
        href: "/dashboard",
    },
    {
        title: "My Trips",
        icon: Plane,
        href: "/dashboard/trips",
    },
    {
        title: "Explore",
        icon: Map,
        href: "/dashboard/explore",
    },
    {
        title: "Itineraries",
        icon: Calendar,
        href: "/dashboard/itineraries",
    },
    {
        title: "Settings",
        icon: Settings,
        href: "/dashboard/settings",
    }
]

interface SidebarProps {
    className?: string
}

export function Sidebar({ className }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const pathname = usePathname()
    const { signOut } = useClerk()
    const { user } = useUser()
    const router = useRouter()

    const handleSignOut = () => {
        signOut(() => router.push('/'))
    }

    // Handle resize and set initial collapsed state
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth
            if (width < 768) { // md breakpoint instead of sm for better tablet experience
                setIsCollapsed(true)
            } else {
                setIsCollapsed(false)
            }
        }

        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Reset mobile menu state on route change
    useEffect(() => {
        setIsMobileMenuOpen(false)
    }, [pathname])

    // Mobile menu button with improved positioning
    const MobileMenuButton = () => (
        <Button
            variant="ghost"
            size="icon"
            className="sm:hidden fixed top-4 left-4 z-50 rounded-full bg-white shadow-sm hover:bg-blue-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
            {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-blue-600" />
            ) : (
                <Menu className="h-5 w-5 text-blue-600" />
            )}
        </Button>
    )

    return (
        <>
            <MobileMenuButton />

            {/* Mobile overlay with improved transition */}
            {isMobileMenuOpen && (
                <div
                    className="sm:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar with improved transitions */}
            <aside className={cn(
                "h-screen fixed top-0 left-0 z-40 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
                isCollapsed ? "w-20" : "w-64",
                isMobileMenuOpen ? "translate-x-0 shadow-xl" : "-translate-x-full sm:translate-x-0",
                className
            )}>
                {/* Logo */}
                <div className="h-16 flex items-center px-4 border-b border-gray-100">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                        <span className="text-xs font-black text-white">TP</span>
                    </div>
                    {!isCollapsed && (
                        <span className="ml-3 text-lg font-semibold text-blue-600">
                            TripPlan AI
                        </span>
                    )}

                    {/* Collapse toggle on desktop */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto hidden sm:flex"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        )}
                    </Button>
                </div>

                {/* Nav items with improved active state and spacing */}
                <nav className="flex-1 px-2 py-6 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center rounded-lg transition-all duration-200 mb-2",
                                    isCollapsed ? "justify-center p-3" : "px-3 py-3 gap-3",
                                    isActive
                                        ? "bg-blue-50 text-blue-600 font-medium"
                                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <item.icon className={cn(
                                    "flex-shrink-0",
                                    isActive ? "text-blue-600" : "text-gray-500",
                                    isCollapsed ? "h-6 w-6" : "h-5 w-5"
                                )} />

                                {!isCollapsed && (
                                    <span className="text-sm">
                                        {item.title}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* User profile with improved mobile layout */}
                {user && (
                    <div className="mt-auto border-t border-gray-200 p-3">
                        <div className={cn(
                            "flex items-center",
                            !isCollapsed && "justify-between",
                            isCollapsed && "flex-col gap-3 items-center"
                        )}>
                            <div className={cn(
                                "flex items-center",
                                isCollapsed && "flex-col gap-2"
                            )}>
                                <UserButton />
                                {!isCollapsed && (
                                    <div className="ml-3 overflow-hidden">
                                        <p className="text-sm font-medium truncate">
                                            {user.firstName || "User"}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {user.primaryEmailAddress?.emailAddress || "user@example.com"}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Re-enabled sign out button with improved styling */}
                            {!isCollapsed ? (
                                <button
                                    onClick={handleSignOut}
                                    aria-label="Sign out"
                                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSignOut}
                                    aria-label="Sign out"
                                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </aside>
        </>
    )
}
'use client'
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, LogOut, Menu, Calendar, Settings, X, Users, Gamepad, BarChart2, FileText } from "lucide-react"
import { useClerk, UserButton, useUser } from "@clerk/nextjs"
import { useUserRole } from "@/hooks/useUserRole"
import { APP_NAME } from "@/utils/constants";

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

    const userRole = useUserRole()

    const handleSignOut = () => {
        signOut(() => router.push('/'))
    }

    const sidebarItems = [
        {
            title: "Dashboard",
            icon: BarChart2,
            href: "/dashboard",
        },
        // {
        //     title: "Pacientes",
        //     icon: Users,
        //     href: "/dashboard/patient",
        // },
        {
            title: "Atividades",
            icon: FileText,
            href: "/dashboard/games",
        },
        // {
        //     title: "Configurações",
        //     icon: Settings,
        //     href: "/dashboard/settings",
        // }
    ]

    // Handle resize and set initial collapsed state
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth
            if (width < 768) { // md breakpoint for tablet experience
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
            className="md:hidden fixed top-4 left-4 z-50 rounded-full bg-white shadow-md hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
            {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-gray-700" />
            ) : (
                <Menu className="h-5 w-5 text-gray-700" />
            )}
        </Button>
    )

    return (
        <>
            <MobileMenuButton />

            {/* Mobile overlay */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar with professional styling */}
            <aside className={cn(
                "fixed top-0 left-0 z-40 h-screen flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out",
                isCollapsed ? "w-20" : "w-64",
                isMobileMenuOpen ? "translate-x-0 shadow-xl" : "-translate-x-full md:translate-x-0",
                className
            )}>
                {/* Logo area */}
                <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-teal-500">
                        <span className="text-sm font-bold text-white">TP</span>
                    </div>
                    {!isCollapsed && (
                        <span className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
                            {APP_NAME}
                        </span>
                    )}

                    {/* Collapse toggle for desktop */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto hidden md:flex text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
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

                {/* Nav items with professional styling */}
                <nav className="flex-1 px-3 py-6 overflow-y-auto">
                    <ul className="space-y-1">
                        {sidebarItems.map((item) => {

                            const isActive = pathname === item.href ||
                                (pathname.startsWith(item.href + '/') && item.href !== '/dashboard') ||
                                (item.href === '/dashboard' && pathname === '/dashboard');
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center rounded-lg transition-all duration-200",
                                            isCollapsed ? "justify-center p-3" : "px-4 py-3",
                                            isActive
                                                ? "bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-medium"
                                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-blue-600 dark:hover:text-blue-400"
                                        )}
                                    >
                                        <item.icon className={cn(
                                            "flex-shrink-0",
                                            isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400",
                                            isCollapsed ? "h-6 w-6" : "h-5 w-5"
                                        )} />

                                        {!isCollapsed && (
                                            <span className="ml-3 text-sm font-medium">
                                                {item.title}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                {/* User profile section */}
                {user && (
                    <div className="mt-auto border-t border-gray-200 dark:border-gray-800 p-4">
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
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                            {user.firstName || "User"}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {user.primaryEmailAddress?.emailAddress || "user@example.com"}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Sign out button */}
                            <button
                                onClick={handleSignOut}
                                aria-label="Sign out"
                                className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </aside>

            {/* Content wrapper */}
            <div className={cn(
                "min-h-screen transition-all duration-300",
                isCollapsed ? "md:ml-20" : "md:ml-64"
            )}>
            </div>
        </>
    )
}
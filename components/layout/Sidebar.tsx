'use client'
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, LogOut, Menu, Map, Calendar, Settings, X, Users, Gamepad } from "lucide-react"
import { useClerk, UserButton, useUser } from "@clerk/nextjs"
import { useUserRole } from "@/hooks/useUserRole"
import {APP_NAME} from "@/utils/constants";



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
            title: "Home",
            icon: Home,
            href: "/dashboard",
        },
        // {
        //     title: "Registered Users",
        //     icon: Users,
        //     href: "/dashboard/users",
        //     visible: userRole.role === 'ADMIN'
        // },
        {
            title: "Atividades",
            icon: Gamepad,
            href: "/dashboard/games",
        },
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
            className="md:hidden fixed top-4 left-4 z-50 rounded-full bg-white shadow-sm hover:bg-blue-50"
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

            {/* Mobile overlay with transition */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar with gradient styling to match landing page */}
            <aside className={cn(
                "fixed top-0 left-0 z-40 h-screen flex flex-col bg-gradient-to-b from-cyan-50 to-blue-50 dark:from-indigo-900 dark:to-blue-900 border-r border-blue-200 dark:border-blue-800 transition-all duration-300 ease-in-out",
                isCollapsed ? "w-20" : "w-64",
                isMobileMenuOpen ? "translate-x-0 shadow-xl" : "-translate-x-full md:translate-x-0",
                className
            )}>
                {/* Logo */}
                <div className="h-16 flex items-center px-4 border-b border-blue-100 dark:border-blue-800">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-yellow-400">
                        <span className="text-sm font-black text-white">TP</span>
                    </div>
                    {!isCollapsed && (
                        <span className="ml-3 text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-yellow-400">
                            {APP_NAME}
                        </span>
                    )}

                    {/* Collapse toggle on desktop */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto hidden md:flex text-blue-600 dark:text-blue-300 hover:text-pink-500 dark:hover:text-pink-400"
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

                {/* Nav items with improved active state and landing page styling */}
                <nav className="flex-1 px-3 py-6 overflow-y-auto">
                    <ul className="space-y-2">
                        {sidebarItems
                            // .filter(item => item.visible === undefined || item.visible === true)
                            .map((item) => {
                                const isActive = pathname === item.href || pathname ===  `${item.href}/`
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "flex items-center rounded-lg transition-all duration-200",
                                                isCollapsed ? "justify-center p-3" : "px-4 py-3",
                                                isActive
                                                    ? "bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-800/50 dark:to-purple-800/50 text-indigo-600 dark:text-indigo-300 font-medium"
                                                    : "text-indigo-600 dark:text-cyan-300 hover:text-pink-500 dark:hover:text-yellow-300 hover:bg-blue-50 dark:hover:bg-indigo-800/50"
                                            )}
                                        >
                                            <item.icon className={cn(
                                                "flex-shrink-0",
                                                isActive ? "text-indigo-600 dark:text-indigo-300" : "text-indigo-500 dark:text-cyan-300",
                                                isCollapsed ? "h-6 w-6" : "h-5 w-5"
                                            )} />

                                            {!isCollapsed && (
                                                <span className="ml-3 text-sm">
                                                    {item.title}
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                )
                            })}
                    </ul>
                </nav>

                {/* User profile with landing page styling */}
                {user && (
                    <div className="mt-auto border-t border-blue-200 dark:border-blue-800 p-4">
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
                                        <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 truncate">
                                            {user.firstName || "User"}
                                        </p>
                                        <p className="text-xs text-indigo-500 dark:text-indigo-400 truncate">
                                            {user.primaryEmailAddress?.emailAddress || "user@example.com"}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Sign out button with landing page styling */}
                            {!isCollapsed ? (
                                <button
                                    onClick={handleSignOut}
                                    aria-label="Sign out"
                                    className="p-2 text-indigo-500 hover:text-pink-500 dark:text-indigo-400 dark:hover:text-pink-400 hover:bg-blue-50 dark:hover:bg-indigo-800 rounded-md transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSignOut}
                                    aria-label="Sign out"
                                    className="p-2 text-indigo-500 hover:text-pink-500 dark:text-indigo-400 dark:hover:text-pink-400 hover:bg-blue-50 dark:hover:bg-indigo-800 rounded-md transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </aside>

            {/* Content wrapper to ensure proper layout with fixed sidebar */}
            <div className={cn(
                "min-h-screen transition-all duration-300",
                isCollapsed ? "md:ml-20" : "md:ml-64"
            )}>
            </div>
        </>
    )
}
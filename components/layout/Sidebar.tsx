'use client'
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, ListTodo, LogOut, Menu, X } from "lucide-react"
import {useClerk, UserButton, useUser} from "@clerk/nextjs"

const sidebarItems = [
    {
        title: "Home",
        icon: Home,
        href: "/dashboard",
    },
    {
        title: "Jogos",
        icon: ListTodo,
        href: "/dashboard/games",
    },
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

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth
            if (width < 640) { // sm breakpoint
                setIsCollapsed(true)
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

    // Mobile menu button
    const MobileMenuButton = () => (
        <Button
            variant="ghost"
            size="icon"
            className="sm:hidden fixed top-4 right-4 z-40 hover:bg-indigo-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
            {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-gray-600" />
            ) : (
                <Menu className="h-5 w-5 text-gray-600" />
            )}
        </Button>
    )

    return (
        <>
            <MobileMenuButton />

            {/* Mobile overlay */}
            {isMobileMenuOpen && (
                <div
                    className="sm:hidden fixed inset-0 bg-black/20 z-30"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "h-screen sticky top-0 left-0 z-30 flex flex-col bg-white border-r border-gray-200 transition-all duration-300",
                isCollapsed ? "w-20" : "w-64",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0",
                className
            )}>
                {/* Logo */}
                <div className="h-16 flex items-center px-4 border-b border-gray-100">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6a45ec]">
                        <span className="text-xs font-black text-white">FS</span>
                    </div>
                    {!isCollapsed && (
                        <span className="ml-3 text-lg font-semibold text-[#6a45ec]">
              FonoSaaS
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

                {/* Nav items */}
                <nav className="flex-1 px-2 py-4 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const isActive = pathname.startsWith(item.href)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center rounded-lg transition-colors mb-1",
                                    isCollapsed ? "justify-center p-3" : "px-3 py-2.5 gap-3",
                                    isActive
                                        ? "bg-[#EAE8FD] text-[#6a45ec]"
                                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <item.icon className={cn(
                                    "flex-shrink-0",
                                    isActive ? "text-[#6a45ec]" : "text-gray-500",
                                    isCollapsed ? "h-6 w-6" : "h-5 w-5"
                                )} />

                                {!isCollapsed && (
                                    <span className="text-sm font-medium">
                    {item.title}
                  </span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* User profile */}
                {user && (
                    <div className="mt-auto border-t border-gray-200 p-3">
                        <div className={cn(
                            "flex items-center",
                            !isCollapsed && "justify-between",
                            isCollapsed && "flex-col items-center"
                        )}>
                            <div className={cn(
                                "flex items-center",
                                isCollapsed && "flex-col"
                            )}>
                  {/*              <div className="w-7 h-7 rounded-full bg-[#EAE8FD] flex items-center justify-center">*/}
                  {/*<span className="text-xs font-medium text-[#6a45ec]">*/}
                  {/*  {user.firstName?.[0] || "J"}*/}
                  {/*</span>*/}
                  {/*              </div>*/}
                                <UserButton />
                                {!isCollapsed && (
                                    <div className="ml-3">
                                        <p className="text-sm font-medium">
                                            {user.firstName || "João Filipe"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {user.primaryEmailAddress?.emailAddress || "jrnromao@gmail.com"}
                                        </p>

                                    </div>
                                )}
                            </div>

                            {/*{!isCollapsed ? (*/}
                            {/*    <button*/}
                            {/*        onClick={handleSignOut}*/}
                            {/*        aria-label="Sign out"*/}
                            {/*        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"*/}
                            {/*    >*/}
                            {/*        <LogOut className="h-4 w-4" />*/}
                            {/*    </button>*/}
                            {/*) : (*/}
                            {/*    <button*/}
                            {/*        onClick={handleSignOut}*/}
                            {/*        aria-label="Sign out"*/}
                            {/*        className="p-1.5 mt-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"*/}
                            {/*    >*/}
                            {/*        <LogOut className="h-4 w-4" />*/}
                            {/*    </button>*/}
                            {/*)}*/}
                        </div>
                    </div>
                )}
            </aside>
        </>
    )
}
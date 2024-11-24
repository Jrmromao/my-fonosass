'use client'
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Home,
    FileText,
    ScrollText,
    ListTodo,
    Settings,
    Menu,
    X
} from "lucide-react"

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
    {
        title: "Configurações",
        icon: Settings,
        href: "/dashboard/settings",
    },
]

interface SidebarProps {
    className?: string
}

export function Sidebar({ className }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [viewportSize, setViewportSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
    const pathname = usePathname()

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth
            if (width < 640) { // sm breakpoint
                setViewportSize('mobile')
            } else if (width < 1024) { // lg breakpoint
                setViewportSize('tablet')
            } else {
                setViewportSize('desktop')
            }

            // Close mobile menu on larger screens
            if (width >= 640) {
                setIsMobileMenuOpen(false)
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

    const isMobile = viewportSize === 'mobile'
    const isTablet = viewportSize === 'tablet'

    // Force collapsed state on tablet
    const effectivelyCollapsed = isTablet || isCollapsed

    const MobileMenuButton = () => (
        <Button
            variant="ghost"
            size="icon"
            className="sm:hidden fixed top-4 right-4 z-50 text-indigo-600 hover:bg-indigo-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
            {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
            ) : (
                <Menu className="h-6 w-6" />
            )}
        </Button>
    )

    const SidebarContent = () => (
        <>
            {/* Header */}
            <div className="h-20 flex items-center px-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                        <span className="text-xs font-black text-white">FS</span>
                    </div>
                    <span className={cn(
                        "text-xl font-bold text-indigo-600 transition-all duration-300",
                        effectivelyCollapsed ? "opacity-0 w-0" : "opacity-100"
                    )}>
                        FonoSaaS
                    </span>
                </div>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 px-2 py-4">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 mb-1",
                                "hover:bg-indigo-50 group",
                                isActive
                                    ? "text-indigo-600 bg-indigo-50 font-medium"
                                    : "text-gray-600"
                            )}
                        >
                            <item.icon className={cn(
                                "h-5 w-5",
                                isActive && "text-indigo-600"
                            )} />
                            <span className={cn(
                                "transition-all duration-300",
                                effectivelyCollapsed ? "opacity-0 w-0" : "opacity-100"
                            )}>
                                {item.title}
                            </span>
                            {effectivelyCollapsed && (
                                <div className="fixed left-16 ml-2 scale-0 group-hover:scale-100 bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap transition-transform">
                                    {item.title}
                                </div>
                            )}
                        </Link>
                    )
                })}
            </nav>
        </>
    )

    const MobileOverlay = () => (
        <div
            className={cn(
                "fixed inset-0 bg-black/20 backdrop-blur-sm z-30 sm:hidden transition-opacity duration-300",
                isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onClick={() => setIsMobileMenuOpen(false)}
        />
    )

    return (
        <>
            <MobileMenuButton />
            <MobileOverlay />

            {/* Sidebar Container */}
            <div className={cn(
                "relative flex",
                isMobile ? "fixed inset-y-0 left-0 z-40" : "relative"
            )}>
                <div className={cn(
                    "flex flex-col bg-white border-r border-gray-200 transition-all duration-300",
                    isMobile && "h-full",
                    isMobile ? (
                        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                    ) : (
                        effectivelyCollapsed ? "w-16" : "w-64"
                    ),
                    className
                )}>
                    <SidebarContent />
                </div>

                {/* Toggle Button - Only show on desktop */}
                {viewportSize === 'desktop' && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "absolute -right-4 top-7 h-8 w-8 rounded-full bg-white border border-gray-200 text-indigo-600 hover:bg-indigo-50",
                            "transform transition-transform duration-300 shadow-sm",
                            isCollapsed ? "rotate-180" : "rotate-0"
                        )}
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        <Menu className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </>
    )
}
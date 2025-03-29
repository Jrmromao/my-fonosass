'use client'

import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screens">
            <Sidebar />

            <main className="flex-1 p-2 overflow-x-hidden">
                {children}
            </main>
        </div>
    )
}
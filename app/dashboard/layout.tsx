// app/(dashboard)/layout.tsx
import {Sidebar} from "@/components/layout/Sidebar"

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen">
            <Sidebar/>
            <main className="flex-1 px-4 md:px-6 py-4">{children}</main>
        </div>
    )
}
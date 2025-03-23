"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter, Search } from 'lucide-react'
import { NewActivityDialog } from "@/components/dialogs/new-activity-dialog"
import { DataTable } from "@/components/table/data-table"
import { activitiesColumns } from "@/components/table/columns/activities"
import { useDebounce } from "@/hooks/use-debounce"
import { getActivities } from "@/lib/actions/activity.action"
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ActivityWithFiles } from "@/types/activity" // Import from shared types

// Create a client
const queryClient = new QueryClient()

// Wrap your component with QueryClientProvider
export default function ActivitiesPage() {
    return (
        <QueryClientProvider client={queryClient}>
            <ActivitiesContent />
        </QueryClientProvider>
    )
}

function ActivitiesContent() {
    const [searchTerm, setSearchTerm] = useState("")
    const debouncedSearch = useDebounce(searchTerm, 500)

    // Use React Query to fetch and cache activities
    const { data, isLoading } = useQuery({
        queryKey: ['activities', debouncedSearch],
        queryFn: async () => {
            const result = await getActivities({
                searchTerm: debouncedSearch,
                limit: 50
            })

            if (result.success && result.activities) {
                return result.activities as unknown as ActivityWithFiles[]
            }
            return [] as ActivityWithFiles[]
        }
    })

    const activities = data || []

    const columns = useMemo(
        () => activitiesColumns({}),
        []
    )

    return (
        <div className="h-full p-8 bg-white">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                        Atividades
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie todas as suas atividades terapêuticas
                    </p>
                </div>
                <NewActivityDialog onSuccess={() => {
                    // Invalidate and refetch activities
                    queryClient.invalidateQueries({ queryKey: ['activities'] })
                }} />
            </div>

            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar atividades..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                </Button>
            </div>

            <div className="border rounded-lg">
                <DataTable
                    columns={columns}
                    data={activities}
                    isLoading={isLoading}
                />
            </div>
        </div>
    )
}
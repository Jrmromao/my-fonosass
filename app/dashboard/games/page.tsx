"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter, Search, X } from 'lucide-react'
import { NewActivityDialog } from "@/components/dialogs/new-activity-dialog"
import { DataTable } from "@/components/table/data-table"
import { activitiesColumns } from "@/components/table/columns/activities"
import { useDebounce } from "@/hooks/use-debounce"
import { getActivities } from "@/lib/actions/activity.action"
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ActivityWithFiles } from "@/types/activity"
import { useUserRole } from "@/hooks/useUserRole"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

const queryClient = new QueryClient()

// Define filter types
interface ActivityFilters {
    phonemes: string[];
    difficultyLevels: string[];
    createdAfter: string | null;
}

// Wrap your component with QueryClientProvider
export default function ActivitiesPage() {
    return (
        <QueryClientProvider client={queryClient}>
            <ActivitiesContent />
        </QueryClientProvider>
    )
}

function ActivitiesContent() {
    const [searchTerm, setSearchTerm] = useState<string>("")
    const debouncedSearch = useDebounce(searchTerm, 500)
    const { role } = useUserRole()

    // Client-side filters
    const [filters, setFilters] = useState<ActivityFilters>({
        phonemes: [],
        difficultyLevels: [],
        createdAfter: null,
    })

    const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)

    // Get unique values for filters
    const [availablePhonemes, setAvailablePhonemes] = useState<string[]>([])
    const [availableDifficultyLevels, setAvailableDifficultyLevels] = useState<string[]>([])

    // Use React Query to fetch and cache activities
    const { data, isLoading } = useQuery({
        queryKey: ['activities', debouncedSearch],
        queryFn: async () => {
            const result = await getActivities({
                searchTerm: debouncedSearch,
                limit: 50
            })

            if (result.success && result.activities) {
                // Extract available filter values from the data
                if (result.activities.length > 0) {
                    const phoneme = [...new Set(result.activities.map(item => item.phoneme).filter(Boolean))] as string[]
                    const difficulty = [...new Set(result.activities.map(item => item.difficulty).filter(Boolean))] as string[]

                    setAvailablePhonemes(phoneme)
                    setAvailableDifficultyLevels(difficulty)
                }

                return result.activities as unknown as ActivityWithFiles[]
            }
            return [] as ActivityWithFiles[]
        }
    })

    const activities = data || []

    // Apply client-side filters
    const filteredActivities = useMemo(() => {
        return activities.filter(activity => {
            // Filter by phoneme
            if (filters.phonemes.length > 0 && !filters.phonemes.includes(activity.phoneme)) {
                return false
            }

            // Filter by difficulty
            if (filters.difficultyLevels.length > 0 && !filters.difficultyLevels.includes(activity.difficulty)) {
                return false
            }

            // Filter by creation date
            if (filters.createdAfter && new Date(activity.createdAt) < new Date(filters.createdAfter)) {
                return false
            }

            return true
        })
    }, [activities, filters])

    const columns = useMemo(
        () => activitiesColumns({
            role: 'ADMIN'
        }),
        []
    )

    // Toggle filter value
    const toggleFilter = (type: keyof ActivityFilters, value: string): void => {
        setFilters(prev => {
            if (type === 'createdAfter') {
                return {
                    ...prev,
                    [type]: value
                }
            }

            const current = [...prev[type as 'phonemes' | 'difficultyLevels' ]]
            const index = current.indexOf(value)

            if (index === -1) {
                current.push(value)
            } else {
                current.splice(index, 1)
            }

            return {
                ...prev,
                [type]: current
            }
        })
    }

    // Clear all filters
    const clearFilters = (): void => {
        setFilters({
            phonemes: [],
            difficultyLevels: [],
            createdAfter: null,
        })
    }

    // Count active filters
    const activeFilterCount = filters.phonemes.length + filters.difficultyLevels.length + (filters.createdAfter ? 1 : 0)

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
                {!isLoading && role === 'ADMIN' && <NewActivityDialog onSuccess={() => {
                    queryClient.invalidateQueries({queryKey: ['activities']})
                }}/>}
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

                <div className="flex items-center gap-2">
                    {activeFilterCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="flex items-center gap-1"
                        >
                            <X className="w-3.5 h-3.5" />
                            Limpar filtros
                        </Button>
                    )}

                    <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="relative">
                                <Filter className="w-4 h-4 mr-2" />
                                Filtros
                                {activeFilterCount > 0 && (
                                    <Badge className="ml-1 px-1 min-w-5 h-5 rounded-full bg-purple-500 text-white">
                                        {activeFilterCount}
                                    </Badge>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <div className="p-2">
                                <h4 className="mb-2 text-sm font-medium">Fonemas</h4>
                                {availablePhonemes.map(phonemes => (
                                    <DropdownMenuCheckboxItem
                                        key={phonemes}
                                        checked={filters.phonemes.includes(phonemes)}
                                        onCheckedChange={() => toggleFilter('phonemes', phonemes)}
                                    >
                                        {phonemes}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </div>

                            <div className="p-2 border-t">
                                <h4 className="mb-2 text-sm font-medium">Nivel de dificuldade</h4>
                                {availableDifficultyLevels.map(levels => (
                                    <DropdownMenuCheckboxItem
                                        key={levels}
                                        checked={filters.difficultyLevels.includes(levels)}
                                        onCheckedChange={() => toggleFilter('difficultyLevels', levels)}
                                    >
                                        {levels}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {filters.phonemes.map(phoneme => (
                        <Badge key={phoneme} variant="outline" className="flex items-center gap-1">
                            Phoneme: {phoneme}
                            <X
                                className="w-3 h-3 ml-1 cursor-pointer"
                                onClick={() => toggleFilter('phonemes', phoneme)}
                            />
                        </Badge>
                    ))}

                    {filters.difficultyLevels.map(level => (
                        <Badge key={level} variant="outline" className="flex items-center gap-1">
                            Level: {level}
                            <X
                                className="w-3 h-3 ml-1 cursor-pointer"
                                onClick={() => toggleFilter('difficultyLevels', level)}
                            />
                        </Badge>
                    ))}
                </div>
            )}

            <div className="border rounded-lg">
                <DataTable
                    columns={columns}
                    data={filteredActivities}
                    isLoading={isLoading}
                />
            </div>
        </div>
    )
}
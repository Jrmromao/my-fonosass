'use client'
import React, { useMemo, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Search,
    ListFilter,
    ChevronDown,
} from 'lucide-react'
import { NewActivityDialog } from "@/components/dialogs/new-activity-dialog"
import { useDebounce } from "@/hooks/use-debounce"
import { getActivities } from "@/lib/actions/activity.action"
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ActivityWithFiles } from "@/types/activity"
import { useUserRole } from "@/hooks/useUserRole"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { activitiesColumns } from "@/components/table/columns/activities"
import PhonemeTabs from "@/components/layout/PhonemeTabs";
import ActivityStatsBar from "@/components/layout/ActivityStatsBar";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import { DataTable } from "@/components/table/data-table";

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
    const [searchTerm, setSearchTerm] = useState<string>("")
    const debouncedSearch = useDebounce(searchTerm, 500)
    const { role } = useUserRole()
    const [activeTab, setActiveTab] = useState("all")
    const [mainTab, setMainTab] = useState("phonemes") // Add state for main tabs

    // Client-side filters
    const [filters, setFilters] = useState({
        difficultyLevels: [] as string[],
        createdAfter: null as string | null,
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

    // Group activities by phoneme for the phoneme tabs
    const phonemeGroups = useMemo(() => {
        const groups: Record<string, ActivityWithFiles[]> = {
            all: activities
        }

        // Create groups for each phoneme
        availablePhonemes.forEach(phoneme => {
            groups[phoneme] = activities.filter(activity => activity.phoneme === phoneme)
        })

        return groups
    }, [activities, availablePhonemes])

    // Apply client-side filters
    const filteredActivities = useMemo(() => {
        // First filter by active tab (phoneme)
        let filtered = activeTab === "all" ? activities : activities.filter(a => a.phoneme === activeTab)

        // Then apply other filters
        return filtered.filter(activity => {
            // Filter by difficulty
            if (filters.difficultyLevels.length > 0 && !filters.difficultyLevels.includes(activity.difficulty)) {
                return false
            }

            // Filter by creation date
            if(filters.createdAfter && new Date(activity.createdAt) < new Date(filters.createdAfter)) {
                return false
            }

            return true
        })
    }, [activities, filters, activeTab])

    const columns = useMemo(
        () => activitiesColumns({
            role: role || 'USER'
        }),
        [role]
    )

    // Toggle filter value
    const toggleFilter = (type: keyof typeof filters, value: string): void => {
        setFilters(prev => {
            if (type === 'createdAfter') {
                return {
                    ...prev,
                    [type]: value
                }
            }

            const current = [...prev[type as 'difficultyLevels']]
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
            difficultyLevels: [],
            createdAfter: null,
        })
    }

    // Count active filters
    const activeFilterCount = filters.difficultyLevels.length + (filters.createdAfter ? 1 : 0)

    return (
        <div className="h-full bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="py-6 px-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
                                Biblioteca de Atividades
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                                Gerencie suas atividades terapêuticas
                            </p>
                        </div>

                        {!isLoading && role === 'ADMIN' && (
                            <NewActivityDialog
                                onSuccess={() => {
                                    queryClient.invalidateQueries({queryKey: ['activities']})
                                }}
                            />
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mt-6">
                        {/* Search */}
                        <div className="relative flex-1 w-full sm:max-w-md">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4"/>
                            <Input
                                placeholder="Buscar atividades..."
                                className="pl-10 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:border-blue-500 dark:focus:border-blue-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                            {activeFilterCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="flex items-center gap-1 text-gray-500 dark:text-gray-400"
                                >
                                    <span className="hidden sm:inline">Limpar</span>
                                </Button>
                            )}

                            <div className="flex items-center">
                                <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="relative">
                                            <ListFilter className="w-4 h-4 sm:mr-2"/>
                                            <span className="hidden sm:inline">Filtros</span>
                                            {activeFilterCount > 0 && (
                                                <Badge
                                                    className="ml-1 px-1 min-w-5 h-5 rounded-full bg-blue-500 text-white border-none">
                                                    {activeFilterCount}
                                                </Badge>
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                                        <DropdownMenuSeparator/>
                                        <div className="p-2">
                                            <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Nível de dificuldade</h4>
                                            {availableDifficultyLevels.map(level => (
                                                <DropdownMenuCheckboxItem
                                                    key={level}
                                                    checked={filters.difficultyLevels.includes(level)}
                                                    onCheckedChange={() => toggleFilter('difficultyLevels', level)}
                                                >
                                                    {level}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <ActivityStatsBar
                activities={activities}
                availablePhonemes={availablePhonemes}
                isLoading={isLoading}
            />

            {/* Active Filters */}
            {activeFilterCount > 0 && (
                <div
                    className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    {filters.difficultyLevels.map(level => (
                        <Badge key={level} className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-none">
                            Nível: {level}
                            <button
                                className="ml-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 p-0.5 -mr-0.5"
                                onClick={() => toggleFilter('difficultyLevels', level)}
                            >
                                <ChevronDown className="w-3 h-3 transform rotate-45 text-blue-700 dark:text-blue-300"/>
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            {/* Main Activity Category Tabs - Modern Elevated Style */}
            <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
                    <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto bg-gray-50 dark:bg-gray-800 p-1 rounded-lg shadow-sm">
                        <TabsTrigger
                            value="phonemes"
                            className="relative rounded-md py-2 text-sm font-medium text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Fonemas
                            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500 data-[state=active]:block hidden transition-all" />
                        </TabsTrigger>
                        <TabsTrigger
                            value="cognitive_language"
                            className="relative rounded-md py-2 text-sm font-medium text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Cognitivo e Linguagem
                            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500 data-[state=active]:block hidden transition-all" />
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="phonemes" className="mt-6">
                        <Card className="border-gray-200 dark:border-gray-800 overflow-hidden shadow-md">
                            <CardContent className="p-0">
                                <PhonemeTabs
                                    activeTab={activeTab}
                                    setActiveTab={setActiveTab}
                                    activities={activities}
                                    availablePhonemes={availablePhonemes}
                                    phonemeGroups={phonemeGroups}
                                    columns={columns}
                                    filteredActivities={filteredActivities}
                                    isLoading={isLoading}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="cognitive_language" className="mt-6">
                        <Card className="border-gray-200 dark:border-gray-800 overflow-hidden shadow-md">
                            <CardHeader className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Cognitivo e linguagem</h3>
                            </CardHeader>
                            <CardContent className="p-0">
                                <DataTable columns={columns} data={[]} isLoading={isLoading} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
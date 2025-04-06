'use client'
import { useMemo, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Filter,
    Search,
    X,
    Volume2,
    Plus,
    FileDown,
    Download,
    BarChart2,
    FileBarChart,
    ListFilter,
    Layers
} from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

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
    const [activeTab, setActiveTab] = useState("all")

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
            if (filters.createdAfter && new Date(activity.createdAt) < new Date(filters.createdAfter)) {
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
    const activeFilterCount = filters.difficultyLevels.length + (filters.createdAfter ? 1 : 0)

    // Get phoneme color class based on phoneme
    const getPhonemeColorClass = (phoneme: string) => {
        const colorMap: Record<string, string> = {
            "B": "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300",
            "CH": "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
            "D": "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
            "R": "bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300",
            "all": "bg-gradient-to-r from-purple-100 to-fuchsia-100 text-purple-600 dark:from-purple-900 dark:to-fuchsia-900 dark:text-purple-300",
        }

        return colorMap[phoneme] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
    }

    return (
        <div className="h-full bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="py-6 px-4 md:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                                Atividades
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Gerencie todas as suas atividades terapêuticas
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

                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        {/* Search */}
                        <div className="relative flex-1 w-full sm:max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Buscar atividades..."
                                className="pl-10"
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
                                    className="flex items-center gap-1"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Limpar filtros</span>
                                </Button>
                            )}

                            <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="relative">
                                        <ListFilter className="w-4 h-4 sm:mr-2" />
                                        <span className="hidden sm:inline">Filtros</span>
                                        {activeFilterCount > 0 && (
                                            <Badge className="ml-1 px-1 min-w-5 h-5 rounded-full bg-purple-500 text-white">
                                                {activeFilterCount}
                                            </Badge>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <div className="p-2">
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
                </div>

                {/* Loading Skeletons for Stats */}
                {isLoading && (
                    <div className="border-t border-gray-200 dark:border-gray-800 py-3 px-4 md:px-6">
                        <div className="flex overflow-x-auto pb-2 md:grid md:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="min-w-[140px] md:w-auto flex-shrink-0 flex items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                    <Skeleton className="w-10 h-10 rounded-full" />
                                    <div className="ml-3 space-y-2">
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-5 w-10" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    {filters.difficultyLevels.map(level => (
                        <Badge key={level} variant="outline" className="flex items-center gap-1">
                            Nivel: {level}
                            <X
                                className="w-3 h-3 ml-1 cursor-pointer"
                                onClick={() => toggleFilter('difficultyLevels', level)}
                            />
                        </Badge>
                    ))}
                </div>
            )}

            {/* Quick Stats Bar - Now above the tabs for better visibility */}
            {!isLoading && activities.length > 0 && (
                <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-3 px-4 md:px-6">
                    <div className="flex overflow-x-auto md:grid md:grid-cols-4 gap-4 pb-1 md:pb-0">
                        <div className="min-w-[140px] md:w-auto flex-shrink-0 flex items-center p-2 rounded-lg bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100 dark:bg-purple-800">
                                <Volume2 className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                            </div>
                            <div className="ml-3">
                                <p className="text-xs text-purple-600 dark:text-purple-300 font-medium">Total</p>
                                <h3 className="text-lg font-bold text-purple-700 dark:text-purple-400">{activities.length}</h3>
                            </div>
                        </div>

                        <div className="min-w-[140px] md:w-auto flex-shrink-0 flex items-center p-2 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-800">
                                <Volume2 className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                            </div>
                            <div className="ml-3">
                                <p className="text-xs text-indigo-600 dark:text-indigo-300 font-medium">Fonemas</p>
                                <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-400">{availablePhonemes.length}</h3>
                            </div>
                        </div>

                        <div className="min-w-[140px] md:w-auto flex-shrink-0 flex items-center p-2 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-800">
                                <FileDown className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                            </div>
                            <div className="ml-3">
                                <p className="text-xs text-blue-600 dark:text-blue-300 font-medium">Arquivos</p>
                                <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400">
                                    {activities.filter(a => a.files && a.files.length > 0).length}
                                </h3>
                            </div>
                        </div>

                        <div className="min-w-[140px] md:w-auto flex-shrink-0 flex items-center p-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-800">
                                <Plus className="h-5 w-5 text-green-600 dark:text-green-300" />
                            </div>
                            <div className="ml-3">
                                <p className="text-xs text-green-600 dark:text-green-300 font-medium">Iniciante</p>
                                <h3 className="text-lg font-bold text-green-700 dark:text-green-400">
                                    {activities.filter(a => a.difficulty === "BEGINNER").length}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Phoneme Tabs & Table */}
            <div className="p-4 md:p-6">
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="overflow-x-auto pb-2">
                        <TabsList className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1 w-auto inline-flex">
                            <TabsTrigger
                                value="all"
                                className={`${activeTab === "all" ? getPhonemeColorClass("all") : ""} min-w-[70px]`}
                            >
                                <span className="flex items-center whitespace-nowrap">
                                    Todos <span className="ml-1.5 text-xs opacity-70 bg-white/30 dark:bg-black/30 px-1.5 py-0.5 rounded-full">
                                        {activities.length}
                                    </span>
                                </span>
                            </TabsTrigger>

                            {availablePhonemes.map(phoneme => (
                                <TabsTrigger
                                    key={phoneme}
                                    value={phoneme}
                                    className={`${activeTab === phoneme ? getPhonemeColorClass(phoneme) : ""} min-w-[70px]`}
                                >
                                    <div className="flex items-center whitespace-nowrap">
                                        {activeTab === phoneme && (
                                            <div className="w-4 h-4 rounded-full flex items-center justify-center bg-white/50 dark:bg-gray-800/50 mr-1.5">
                                                <Volume2 className="h-2.5 w-2.5" />
                                            </div>
                                        )}
                                        <span>{phoneme}</span>
                                        <span className="ml-1.5 text-xs opacity-70 bg-white/30 dark:bg-black/30 px-1.5 py-0.5 rounded-full">
                                            {phonemeGroups[phoneme]?.length || 0}
                                        </span>
                                    </div>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    {/* Mobile View - Phoneme Pills */}
                    <div className="md:hidden flex flex-wrap gap-2 my-3">
                        {availablePhonemes.map(phoneme => {
                            const isActive = activeTab === phoneme;
                            const count = phonemeGroups[phoneme]?.length || 0;

                            return (
                                <button
                                    key={phoneme}
                                    onClick={() => setActiveTab(phoneme)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-full flex items-center
                                        ${isActive
                                        ? getPhonemeColorClass(phoneme)
                                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                                    }`}
                                >
                                    {phoneme}
                                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs
                                        ${isActive
                                        ? 'bg-white/20 dark:bg-black/20'
                                        : 'bg-gray-100 dark:bg-gray-700'
                                    }`}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full flex items-center
                                ${activeTab === 'all'
                                ? getPhonemeColorClass('all')
                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                            }`}
                        >
                            Todos
                            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs
                                ${activeTab === 'all'
                                ? 'bg-white/20 dark:bg-black/20'
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}
                            >
                                {activities.length}
                            </span>
                        </button>
                    </div>

                    <TabsContent value={activeTab} className="mt-4">
                        <Card className="border rounded-lg shadow-sm">
                            <CardContent className="p-0">
                                <DataTable
                                    columns={columns}
                                    data={filteredActivities}
                                    isLoading={isLoading}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
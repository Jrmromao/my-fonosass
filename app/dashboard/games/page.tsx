"use client"

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ListFilter, ChevronDown } from "lucide-react";
import { NewActivityDialog } from "@/components/dialogs/new-activity-dialog";
import { useDebounce } from "@/hooks/use-debounce";
import { getActivities } from "@/lib/actions/activity.action";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ActivityWithFiles } from "@/types/activity";
import { useUserRole } from "@/hooks/useUserRole";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { activitiesColumns } from "@/components/table/columns/activities";
import PhonemeFilter from "@/components/layout/PhonemeFilter";
import TypeFilter from "@/components/layout/TypeFilter";
import EmptyState from "@/components/layout/EmptyState";
import ActivityStatsBar from "@/components/layout/ActivityStatsBar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/table/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import {Role} from "@/utils/constants";

const queryClient = new QueryClient();

export default function ActivitiesPage() {
    return (
        <QueryClientProvider client={queryClient}>
            <ActivitiesContent />
        </QueryClientProvider>
    );
}

function ActivityFilters(
    searchTerm: string,
    setSearchTerm: (value: string | ((prevState: string) => string)) => void,
    activeFilterCount: number,
    clearFilters: () => void,
    isFilterOpen: boolean,
    setIsFilterOpen: (value: boolean | ((prevState: boolean) => boolean)) => void,
    availableDifficultyLevels: string[],
    availableTypeOfActivity: string[],
    filters: {
        difficultyLevels: string[];
        typeOfActivity: string[];
        createdAfter: string | null;
    },
    toggleFilter: (type: keyof typeof filters, value: string) => void,
    mainTab: string
) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mt-6">
            {/* Search */}
            <div className="relative flex-1 w-full sm:max-w-md">
                {/*<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />*/}
                {/*<Input*/}
                {/*    placeholder="Buscar atividades..."*/}
                {/*    className="pl-10 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"*/}
                {/*    value={searchTerm}*/}
                {/*    onChange={(e) => setSearchTerm(e.target.value)}*/}
                {/*/>*/}
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
                {activeFilterCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                        <span>Limpar Filtros</span>
                    </Button>
                )}
                <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="relative border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                        >
                            <ListFilter className="w-4 h-4 mr-2" />
                            Filtros
                            {activeFilterCount > 0 && (
                                <Badge className="ml-2 px-2 h-5 rounded-full bg-blue-500 text-white border-none">
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 shadow-lg rounded-md">
                        <DropdownMenuLabel className="text-gray-700 dark:text-gray-300">Filtrar por</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                        <div className="p-2">
                            <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Nível de dificuldade</h4>
                            {availableDifficultyLevels.map((level) => (
                                <DropdownMenuCheckboxItem
                                    key={level}
                                    checked={filters.difficultyLevels.includes(level)}
                                    onCheckedChange={() => toggleFilter("difficultyLevels", level)}
                                    className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    {level}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </div>
                        {mainTab !== "types" && availableTypeOfActivity.length > 0 && (
                            <div className="p-2">
                                <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Atividade</h4>
                                {availableTypeOfActivity.map((type) => (
                                    <DropdownMenuCheckboxItem
                                        key={type}
                                        checked={filters.typeOfActivity.includes(type)}
                                        onCheckedChange={() => toggleFilter("typeOfActivity", type)}
                                        className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        {type}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </div>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

function ActivitiesContent() {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const debouncedSearch = useDebounce(searchTerm, 500);
    const { role } = useUserRole();
    const [mainTab, setMainTab] = useState("phonemes");
    const [selectedPhoneme, setSelectedPhoneme] = useState("all");
    const [selectedType, setSelectedType] = useState("all");

    // Client-side filters
    const [filters, setFilters] = useState({
        difficultyLevels: [] as string[],
        createdAfter: null as string | null,
        typeOfActivity: [] as string[],
    });

    const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

    // Get unique values for filters
    const [availablePhonemes, setAvailablePhonemes] = useState<string[]>([]);
    const [availableDifficultyLevels, setAvailableDifficultyLevels] = useState<string[]>([]);
    const [availableTypeOfActivity, setAvailableTypeOfActivity] = useState<string[]>([]);

    // Use React Query to fetch and cache activities
    const { data, isLoading } = useQuery({
        queryKey: ["activities", debouncedSearch],
        queryFn: async () => {
            const result = await getActivities({
                searchTerm: debouncedSearch,
                limit: 50,
            });

            if (result.success && result.activities) {
                if (result.activities.length > 0) {
                    const phonemes = [...new Set(result.activities.map((item) => item.phoneme).filter(Boolean))] as string[];
                    const difficulties = [...new Set(result.activities.map((item) => item.difficulty).filter(Boolean))] as string[];
                    const types = [...new Set(
                        result.activities
                            .filter(item => item.type !== "OTHER")
                            .map(item => item.type)
                    )] as string[];


                    setAvailablePhonemes(phonemes);
                    setAvailableDifficultyLevels(difficulties);
                    setAvailableTypeOfActivity(types);
                }
                return result.activities as unknown as ActivityWithFiles[];
            }
            return [] as ActivityWithFiles[];
        },
    });

    const activities = data || [];

    // Apply client-side filters
    const filteredActivities = useMemo(() => {
        let filtered = activities;

        // Filter based on main tab and selected phoneme/type
        if (mainTab === "phonemes" && selectedPhoneme !== "all") {
            filtered = filtered.filter((a) => a.phoneme === selectedPhoneme);
        } else if (mainTab === "types" && selectedType !== "all") {
            filtered = filtered.filter((a) => a.type === selectedType);
        }

        // Apply additional filters
        return filtered.filter((activity) => {
            if (filters.difficultyLevels.length > 0 && !filters.difficultyLevels.includes(activity.difficulty)) {
                return false;
            }
            if (filters.createdAfter && new Date(activity.createdAt) < new Date(filters.createdAfter)) {
                return false;
            }
            if (filters.typeOfActivity.length > 0 && !filters.typeOfActivity.includes(activity.type)) {
                return false;
            }
            return true;
        });
    }, [activities, filters, mainTab, selectedPhoneme, selectedType]);

    const columns = useMemo(
        () =>
            activitiesColumns({
                role: role || "USER",
            }),
        [role]
    );

    // Toggle filter value
    const toggleFilter = (type: keyof typeof filters, value: string): void => {
        setFilters((prev) => {
            if (type === "createdAfter") {
                return {
                    ...prev,
                    [type]: value,
                };
            }
            const current = [...prev[type as "difficultyLevels" | "typeOfActivity"]];
            const index = current.indexOf(value);
            if (index === -1) {
                current.push(value);
            } else {
                current.splice(index, 1);
            }
            return {
                ...prev,
                [type]: current,
            };
        });
    };

    // Clear all filters
    const clearFilters = (): void => {
        setFilters({
            difficultyLevels: [],
            createdAfter: null,
            typeOfActivity: [],
        });
    };

    // Count active filters
    const activeFilterCount =
        filters.difficultyLevels.length + (filters.createdAfter ? 1 : 0) + filters.typeOfActivity.length;

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
                            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Gerencie suas atividades terapêuticas</p>
                        </div>
                        {!isLoading && role === Role.ADMIN && (
                            <NewActivityDialog
                                onSuccess={() => {
                                    queryClient.invalidateQueries({ queryKey: ["activities"] });
                                }}
                            />
                        )}
                    </div>
                    {/*{ActivityFilters(*/}
                    {/*    searchTerm,*/}
                    {/*    setSearchTerm,*/}
                    {/*    activeFilterCount,*/}
                    {/*    clearFilters,*/}
                    {/*    isFilterOpen,*/}
                    {/*    setIsFilterOpen,*/}
                    {/*    availableDifficultyLevels,*/}
                    {/*    availableTypeOfActivity,*/}
                    {/*    filters,*/}
                    {/*    toggleFilter,*/}
                    {/*    mainTab*/}
                    {/*)}*/}
                </div>
            </div>

            {/* Stats Bar */}
            <ActivityStatsBar activities={activities} availablePhonemes={availablePhonemes} isLoading={isLoading} />

            {/* Active Filters */}
            {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    {filters.difficultyLevels.map((level) => (
                        <Badge
                            key={level}
                            className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-none"
                        >
                            Nível: {level}
                            <button
                                className="ml-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 p-0.5 -mr-0.5"
                                onClick={() => toggleFilter("difficultyLevels", level)}
                            >
                                <ChevronDown className="w-3 h-3 transform rotate-45 text-blue-700 dark:text-blue-300" />
                            </button>
                        </Badge>
                    ))}
                    {filters.typeOfActivity.map((type) => (
                        <Badge
                            key={type}
                            className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-none"
                        >
                            Tipo: {type}
                            <button
                                className="ml-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 p-0.5 -mr-0.5"
                                onClick={() => toggleFilter("typeOfActivity", type)}
                            >
                                <ChevronDown className="w-3 h-3 transform rotate-45 text-blue-700 dark:text-blue-300" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            {/* Main Tabs */}
            <div className="p-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <Card className="border-gray-200 dark:border-gray-800 shadow-md rounded-lg overflow-hidden">
                    <CardContent className="p-0">
                        <Tabs
                            value={mainTab}
                            onValueChange={(value) => {
                                setMainTab(value);
                                setSelectedPhoneme("all");
                                setSelectedType("all");
                            }}
                            className="w-full"
                        >
                            <TabsList
                                className="relative flex justify-start bg-gray-100 dark:bg-gray-800 rounded-t-md overflow-x-auto scrollbar-hide scroll-smooth snap-x after:content-[''] after:absolute after:right-0 after:top-0 after:h-full after:w-6 after:bg-gradient-to-l after:from-gray-100 after:to-transparent dark:after:from-gray-800"
                            >
                                <TabsTrigger
                                    value="phonemes"
                                    className="snap-start min-w-max px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300
               data-[state=active]:text-white data-[state=active]:bg-gradient-to-r
               data-[state=active]:from-blue-500 data-[state=active]:to-teal-500
               data-[state=active]:shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
               transition-all rounded-md"
                                    aria-label="Visualizar atividades por fonemas"
                                >
                                    Fonemas
                                </TabsTrigger>

                                <TabsTrigger
                                    value="types"
                                    className="snap-start min-w-max px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300
               data-[state=active]:text-white data-[state=active]:bg-gradient-to-r
               data-[state=active]:from-blue-500 data-[state=active]:to-teal-500
               data-[state=active]:shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
               transition-all rounded-md"
                                    aria-label="Visualizar atividades por tipos"
                                >
                                    Tipos de Atividade
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="phonemes" className="p-6">
                                <Card className="border-gray-200 dark:border-gray-800">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                                            Atividades por Fonema
                                        </CardTitle>
                                        <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                                            Explore atividades agrupadas por fonema ou selecione um fonema específico.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between mb-4">
                                            <PhonemeFilter
                                                selectedPhoneme={selectedPhoneme}
                                                setSelectedPhoneme={setSelectedPhoneme}
                                                availablePhonemes={availablePhonemes}
                                            />
                                        </div>
                                        {isLoading ? (
                                            <div className="space-y-4">
                                                <Skeleton className="h-10 w-full" />
                                                <Skeleton className="h-64 w-full" />
                                            </div>
                                        ) : filteredActivities.length === 0 ? (
                                            <EmptyState />
                                        ) : (
                                            <DataTable columns={columns} data={filteredActivities} isLoading={isLoading} />
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="types" className="p-6">
                                <Card className="border-gray-200 dark:border-gray-800">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                                            Atividades por Tipo
                                        </CardTitle>
                                        <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                                            Explore atividades agrupadas por tipo ou selecione um tipo específico.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between mb-4">
                                            <TypeFilter
                                                selectedType={selectedType}
                                                setSelectedType={setSelectedType}
                                                availableTypes={availableTypeOfActivity}
                                            />
                                        </div>
                                        {isLoading ? (
                                            <div className="space-y-4">
                                                <Skeleton className="h-10 w-full" />
                                                <Skeleton className="h-64 w-full" />
                                            </div>
                                        ) : filteredActivities.length === 0 ? (
                                            <EmptyState />
                                        ) : (
                                            <DataTable columns={columns} data={filteredActivities} isLoading={isLoading} />
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
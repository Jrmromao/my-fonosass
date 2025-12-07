// Your provided code - it looks correct for client-side handling
// The issue is likely external to this specific file's logic
'use client';

import { NewActivityDialog } from '@/components/dialogs/new-activity-dialog';
import ActivityStatsBar from '@/components/layout/ActivityStatsBar';
import ActivityStatsBarPlaceholder from '@/components/layout/ActivityStatsBarPlaceholder';
import EmptyState from '@/components/layout/EmptyState';
import PhonemeFilter from '@/components/layout/PhonemeFilter';
import TypeFilter from '@/components/layout/TypeFilter';
import { activitiesColumns } from '@/components/table/columns/activities';
import { DataTable } from '@/components/table/data-table';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDebounce } from '@/hooks/use-debounce';
import { getActivities } from '@/lib/actions/activity.action';
import { ActivityWithFiles } from '@/types/activity';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

// Keep the QueryClientProvider setup outside
const queryClient = new QueryClient();

export default function ActivitiesPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ActivitiesContent />
    </QueryClientProvider>
  );
}

function ActivitiesContent() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [mainTab, setMainTab] = useState('phonemes');
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side rendering to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);
  const [selectedPhoneme, setSelectedPhoneme] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Client-side filters (difficulty and potentially type when on phonemes tab)
  const [filters, setFilters] = useState({
    difficultyLevels: [] as string[],
    createdAfter: null as string | null,
    typeOfActivity: [] as string[], // Used only when mainTab is 'phonemes'
  });

  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  // Get unique values for filters
  const [availablePhonemes, setAvailablePhonemes] = useState<string[]>([]);
  const [availableDifficultyLevels, setAvailableDifficultyLevels] = useState<
    string[]
  >([]);
  const [availableTypeOfActivity, setAvailableTypeOfActivity] = useState<
    string[]
  >([]);

  // Use React Query to fetch and cache activities
  // Include mainTab in the queryKey to refetch data when the tab changes
  const { data, isLoading, error } = useQuery({
    queryKey: ['activities', debouncedSearch, mainTab], // ADD mainTab here
    queryFn: async () => {
      const result = await getActivities({
        searchTerm: debouncedSearch,
        limit: 50,
      });

      if (result.success && result.activities) {
        // Process all activities fetched to extract available filters
        if (result.activities.length > 0) {
          // Extract phonemes, difficulties, and types from the *entire* fetched dataset
          // to populate the filter options correctly regardless of the current tab/selection.
          const allPhonemes = [
            ...new Set(
              result.activities.map((item) => item.phoneme).filter(Boolean)
            ),
          ] as string[];
          const allDifficulties = [
            ...new Set(
              result.activities.map((item) => item.difficulty).filter(Boolean)
            ),
          ] as string[];
          const allTypes = [
            ...new Set(
              result.activities
                .filter((item) => item.type && item.type !== 'OTHER') // Exclude "OTHER" from type filters
                .map((item) => item.type)
            ),
          ] as string[];

          setAvailablePhonemes(allPhonemes);
          setAvailableDifficultyLevels(allDifficulties);
          setAvailableTypeOfActivity(allTypes);
        } else {
          setAvailablePhonemes([]);
          setAvailableDifficultyLevels([]);
          setAvailableTypeOfActivity([]);
        }
        return result.activities as unknown as ActivityWithFiles[];
      }
      // Handle error or empty result
      setAvailablePhonemes([]);
      setAvailableDifficultyLevels([]);
      setAvailableTypeOfActivity([]);
      return [] as ActivityWithFiles[];
    },
    // Optional: You can add a staleTime or gcTime if needed
    // staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
  });

  const activities = useMemo(() => data || [], [data]);

  // --- Corrected Client-side filtering logic ---
  const filteredActivities = useMemo(() => {
    let currentFiltered = activities;

    // Apply primary filter based on the active main tab
    if (mainTab === 'phonemes') {
      // On phonemes tab, show activities with a defined phoneme initially
      currentFiltered = currentFiltered.filter(
        (a) => a.phoneme && a.phoneme !== ''
      );
      // Then apply the specific selected phoneme filter if not "all"
      if (selectedPhoneme !== 'all') {
        currentFiltered = currentFiltered.filter(
          (a) => a.phoneme === selectedPhoneme
        );
      }
    } else if (mainTab === 'types') {
      // On types tab, show activities with a specific type initially (exclude "OTHER")
      currentFiltered = currentFiltered.filter(
        (a) => a.type && a.type !== 'OTHER'
      );
      // Then apply the specific selected type filter if not "all"
      if (selectedType !== 'all') {
        currentFiltered = currentFiltered.filter(
          (a) => a.type === selectedType
        );
      }
    }

    // Apply secondary filters from the dropdown (difficulty, and type if on phonemes tab)
    currentFiltered = currentFiltered.filter((activity) => {
      // Difficulty filter applies to both tabs
      if (
        filters.difficultyLevels.length > 0 &&
        !filters.difficultyLevels.includes(activity.difficulty)
      ) {
        return false;
      }
      // Type filter from dropdown applies ONLY if we are on the 'phonemes' tab
      // because on the 'types' tab, `selectedType` is the primary filter handled above.
      if (
        mainTab === 'phonemes' &&
        filters.typeOfActivity.length > 0 &&
        !filters.typeOfActivity.includes(activity.type)
      ) {
        return false;
      }
      // createdAfter filter is commented out, but would go here...
      // if (filters.createdAfter && new Date(activity.createdAt) < new Date(filters.createdAfter)) {
      //     return false;
      // }
      return true;
    });

    return currentFiltered;
  }, [activities, filters, mainTab, selectedPhoneme, selectedType]); // Depend on relevant states

  // DEFINE columns using useMemo
  const columns = useMemo(
    () =>
      activitiesColumns({
        role: 'USER', // Default to USER role for now
        isPhoneme: mainTab === 'phonemes', // This correctly sets the prop
      }),
    [mainTab]
  );

  // Toggle filter value (Keep as is)
  const toggleFilter = (type: keyof typeof filters, value: string): void => {
    setFilters((prev) => {
      if (type === 'createdAfter') {
        return {
          ...prev,
          [type]: value,
        };
      }
      const current = [...prev[type as 'difficultyLevels' | 'typeOfActivity']];
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

  // Clear all filters (Keep as is)
  const clearFilters = (): void => {
    setFilters({
      difficultyLevels: [],
      createdAfter: null,
      typeOfActivity: [],
    });
  };

  // Count active filters (Keep as is)
  const activeFilterCount =
    filters.difficultyLevels.length +
    (filters.createdAfter ? 1 : 0) +
    filters.typeOfActivity.length;

  // Effect to reset filters when the main tab changes
  useEffect(() => {
    // Reset dropdown filters when switching main tabs
    clearFilters();
    // selectedPhoneme and selectedType are also reset in the onValueChange handler for Tabs
    setSelectedPhoneme('all'); // Ensure these are reset on tab change
    setSelectedType('all');
  }, [mainTab]); // Run this effect whenever mainTab changes

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
            {isClient && (
              <NewActivityDialog
                onSuccess={() => {
                  // Invalidate queries relevant to the current tab to refetch
                  queryClient.invalidateQueries({
                    queryKey: ['activities', debouncedSearch, mainTab],
                  });
                }}
              />
            )}
          </div>
          {/* ActivityFilters component - if its contents are moved, you can remove this call */}
          {/*{ActivityFilters(...)}*/}
        </div>
      </div>

      {/* Stats Bar */}
      {isLoading ? (
        <ActivityStatsBarPlaceholder />
      ) : (
        // Pass all activities to the stats bar so it can calculate totals across all categories
        <ActivityStatsBar
          activities={activities}
          availablePhonemes={availablePhonemes}
          isLoading={isLoading}
        />
      )}

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
                onClick={() => toggleFilter('difficultyLevels', level)}
              >
                <ChevronDown className="w-3 h-3 transform rotate-45 text-blue-700 dark:text-blue-300" />
              </button>
            </Badge>
          ))}
          {/* Only show Type filter badge if on the phonemes tab */}
          {mainTab === 'phonemes' &&
            filters.typeOfActivity.map((type) => (
              <Badge
                key={type}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-none"
              >
                Tipo: {type}
                <button
                  className="ml-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 p-0.5 -mr-0.5"
                  onClick={() => toggleFilter('typeOfActivity', type)}
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
                setSelectedPhoneme('all');
                setSelectedType('all');
                clearFilters(); // Also clear dropdown filters on tab change
              }}
              className="w-full"
            >
              <TabsList className="flex justify-start bg-gray-100 dark:bg-gray-800 p-1 gap-1 rounded-lg">
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
                  Atividades Diversas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="phonemes" className="p-6">
                {/* CardHeader for Phonemes Tab - Modified */}
                <Card className="border-gray-200 dark:border-gray-800">
                  <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    {' '}
                    {/* Added responsive flex classes */}
                    {/* Wrapper for Title and Description - takes full width on small screens */}
                    <div className="w-full sm:w-auto flex flex-col space-y-1 md:space-y-0">
                      <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        Atividades por Fonema
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                        Explore atividades agrupadas por fonema ou selecione um
                        fonema específico.
                      </CardDescription>
                    </div>
                    {/* Search Input Container */}
                    <div className="relative w-full max-w-xs sm:ml-auto">
                      {' '}
                      {/* sm:ml-auto pushes to right on larger screens */}
                      {/*<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />*/}
                      {/*<Input*/}
                      {/*    placeholder="Buscar atividades..."*/}
                      {/*    className="pl-10 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"*/}
                      {/*    value={searchTerm}*/}
                      {/*    onChange={(e) => setSearchTerm(e.target.value)}*/}
                      {/*/>*/}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Phoneme Filter */}
                    <div className="flex items-center justify-between mb-4">
                      <PhonemeFilter
                        selectedPhoneme={selectedPhoneme}
                        setSelectedPhoneme={setSelectedPhoneme}
                        availablePhonemes={availablePhonemes}
                      />
                      {/* Include search and dropdown filters here if desired - Search is now in header */}
                    </div>
                    {/* DataTable or Skeleton/EmptyState */}
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-64 w-full" />
                      </div>
                    ) : filteredActivities.length === 0 ? (
                      <EmptyState />
                    ) : (
                      <DataTable
                        columns={columns}
                        data={filteredActivities}
                        isLoading={isLoading}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="types" className="p-6">
                {/* CardHeader for Types Tab - Modified (Same structure as Phonemes tab) */}
                <Card className="border-gray-200 dark:border-gray-800">
                  <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    {' '}
                    {/* Added responsive flex classes */}
                    {/* Wrapper for Title and Description - takes full width on small screens */}
                    <div className="w-full sm:w-auto flex flex-col space-y-1 md:space-y-0">
                      <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        Atividades por Tipo
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                        Explore atividades agrupadas por tipo ou selecione um
                        tipo específico.
                      </CardDescription>
                    </div>
                    {/* Search Input Container */}
                    <div className="relative w-full max-w-xs sm:ml-auto">
                      {' '}
                      {/* sm:ml-auto pushes to right on larger screens */}
                      {/*<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />*/}
                      {/*<Input*/}
                      {/*    placeholder="Buscar atividades..." // You might change placeholder text*/}
                      {/*    className="pl-10 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"*/}
                      {/*    value={searchTerm}*/}
                      {/*    onChange={(e) => setSearchTerm(e.target.value)}*/}
                      {/*/>*/}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Type Filter */}
                    <div className="flex items-center justify-between mb-4">
                      <TypeFilter
                        selectedType={selectedType}
                        setSelectedType={setSelectedType}
                        availableTypes={availableTypeOfActivity}
                      />
                    </div>
                    {/* DataTable or Skeleton/EmptyState */}
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-64 w-full" />
                      </div>
                    ) : filteredActivities.length === 0 ? (
                      <EmptyState />
                    ) : (
                      <DataTable
                        columns={columns}
                        data={filteredActivities}
                        isLoading={isLoading}
                      />
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

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/table/data-table";
import { ActivityWithFiles } from "@/types/activity";

interface TypeTabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    activities: ActivityWithFiles[];
    availableTypes: string[];
    typeGroups: Record<string, ActivityWithFiles[]>;
    columns: any; // Adjust type based on your activitiesColumns
    filteredActivities: ActivityWithFiles[];
    isLoading: boolean;
}

const TypeTabs: React.FC<TypeTabsProps> = ({
                                               activeTab,
                                               setActiveTab,
                                               activities,
                                               availableTypes,
                                               typeGroups,
                                               columns,
                                               filteredActivities,
                                               isLoading,
                                           }) => {
    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex flex-wrap justify-start h-auto bg-gray-100 dark:bg-gray-800 rounded-t-md">
                <TabsTrigger
                    value="all"
                    className="px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:dark:bg-gray-900 data-[state=active]:shadow-sm"
                >
                    Todas ({activities.length})
                </TabsTrigger>
                {availableTypes.map((type) => (
                    <TabsTrigger
                        key={type}
                        value={type}
                        className="px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:dark:bg-gray-900 data-[state=active]:shadow-sm"
                    >
                        {type} ({typeGroups[type]?.length || 0})
                    </TabsTrigger>
                ))}
            </TabsList>
            <TabsContent value="all" className="p-4 bg-white dark:bg-gray-900">
                <DataTable columns={columns} data={filteredActivities} isLoading={isLoading} />
            </TabsContent>
            {availableTypes.map((type) => (
                <TabsContent key={type} value={type} className="p-4 bg-white dark:bg-gray-900">
                    <DataTable
                        columns={columns}
                        data={filteredActivities.filter((activity) => activity.type === type)}
                        isLoading={isLoading}
                    />
                </TabsContent>
            ))}
        </Tabs>
    );
};

export default TypeTabs;
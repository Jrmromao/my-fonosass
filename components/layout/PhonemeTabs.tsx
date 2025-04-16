import React from "react";
import {Volume2} from "lucide-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Card, CardContent} from "@/components/ui/card";
import {DataTable} from "@/components/table/data-table";
import {ActivityWithFiles} from "@/types/activity";

interface PhonemesTabsProps {
    activeTab: string;
    setActiveTab: (value: string) => void;
    activities: ActivityWithFiles[];
    availablePhonemes: string[];
    phonemeGroups: Record<string, ActivityWithFiles[]>;
    columns: any[];
    filteredActivities: ActivityWithFiles[];
    isLoading: boolean;
}

const PhonemeTabs: React.FC<PhonemesTabsProps> = ({
                                                      activeTab,
                                                      setActiveTab,
                                                      activities,
                                                      availablePhonemes,
                                                      phonemeGroups,
                                                      columns,
                                                      filteredActivities,
                                                      isLoading,
                                                  }) => {
    return (
        <div className="p-4 md:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="overflow-x-auto pb-3">
                    <TabsList
                        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1 w-auto inline-flex rounded-md">
                        <TabsTrigger
                            value="all"
                            className="min-w-[80px] px-4 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800"
                        >
              <span className="flex items-center whitespace-nowrap">
                <span className="font-medium">Todos</span>
                <span
                    className="ml-1.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded-full">
                  {activities.length}
                </span>
              </span>
                        </TabsTrigger>

                        {availablePhonemes.map((phoneme) => (
                            <TabsTrigger
                                key={phoneme}
                                value={phoneme}
                                className="min-w-[70px] px-4 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800"
                            >
                                <div className="flex items-center whitespace-nowrap">
                                    {activeTab === phoneme && (
                                        <div
                                            className="w-4 h-4 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/40 mr-1.5">
                                            <Volume2 className="h-2.5 w-2.5 text-blue-600 dark:text-blue-400"/>
                                        </div>
                                    )}
                                    <span className="font-medium">{phoneme}</span>
                                    <span
                                        className="ml-1.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded-full">
                                {phonemeGroups[phoneme]?.length || 0}
                             </span>
                                </div>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {/* Mobile View - Phoneme Pills */}
                <div className="md:hidden flex flex-wrap gap-2 my-4">
                    {availablePhonemes.map((phoneme) => {
                        const isActive = activeTab === phoneme;
                        const count = phonemeGroups[phoneme]?.length || 0;

                        return (
                            <button
                                key={phoneme}
                                onClick={() => setActiveTab(phoneme)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-full flex items-center ${
                                    isActive
                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                                        : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                                }`}
                            >
                                {phoneme}
                                <span
                                    className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs
                  ${
                                        isActive
                                            ? "bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                    }`}
                                >
                  {count}
                </span>
                            </button>
                        );
                    })}
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full flex items-center
              ${
                            activeTab === "all"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                    >
                        Todos
                        <span
                            className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs
              ${
                                activeTab === "all"
                                    ? "bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                            }`}
                        >
              {activities.length}
            </span>
                    </button>
                </div>

                <TabsContent value={activeTab} className="mt-4">
                    <Card className="border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
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
    );
};

export default PhonemeTabs;
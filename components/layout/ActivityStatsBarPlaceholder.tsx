import React from "react";
import { Volume2, FileDown, Plus, BarChart2 } from "lucide-react";

// This is a placeholder component for ActivityStatsBar
const ActivityStatsBarPlaceholder: React.FC = () => {
    // Define a placeholder structure that mimics the real component's layout
    const placeholderStats = [
        { id: "total", label: "Total de atividades", icon: BarChart2 },
        { id: "phonemes", label: "Exercícios para Fonemas", icon: Volume2 },
        { id: "files", label: "Execicios para Linguagem", icon: FileDown },
        { id: "beginner", label: "Nível iniciante", icon: Plus },
    ];

    return (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 animate-pulse">
            <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {placeholderStats.map((stat) => (
                        <div
                            key={stat.id}
                            className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 p-4"
                        >
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-md bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                                    {/* Optional: You could add a subtle icon placeholder here if desired */}
                                    <stat.icon className="w-5 h-5 text-gray-400 dark:text-gray-600" />
                                </div>
                                <div className="ml-4 w-full">
                                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                                    <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ActivityStatsBarPlaceholder;
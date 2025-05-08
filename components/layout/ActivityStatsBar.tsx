import React from "react";
import { Volume2, FileDown, Plus, BarChart2 } from "lucide-react";
import { ActivityWithFiles } from "@/types/activity";

interface ActivityStatsBarProps {
    activities: ActivityWithFiles[];
    availablePhonemes: string[];
    isLoading: boolean;
}

const ActivityStatsBar: React.FC<ActivityStatsBarProps> = ({
                                                               activities,
                                                               availablePhonemes,
                                                               isLoading,
                                                           }) => {
    if (isLoading || activities.length === 0) return null;

    const stats = [
        {
            id: "total",
            label: "Total de atividades",
            value: activities.length,
            icon: BarChart2,
            color: "ocean"
        },
        {
            id: "phonemes",
            label: "Exercícios para Fonemas",
            value: activities.filter(a => a.phoneme !== "").length,
            icon: Volume2,
            color: "tropical"
        },
        {
            id: "files",
            label: "Atividades Diversas",
            value: activities.filter(a => a.type !== "OTHER").length,
            icon: FileDown,
            color: "sunshine"
        },
        {
            id: "beginner",
            label: "Nível iniciante",
            value: activities.filter(a => a.difficulty === "BEGINNER").length,
            icon: Plus,
            color: "bubblegum"
        }
    ];

    return (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <StatCard key={stat.id} stat={stat} />
                    ))}
                </div>
            </div>
        </div>
    );
};

interface StatCardProps {
    stat: {
        id: string;
        label: string;
        value: number;
        icon: React.ElementType;
        color: string;
    };
}

const StatCard: React.FC<StatCardProps> = ({ stat }) => {
    const colorClasses: Record<string, {
        bg: string;
        icon: string;
        text: string;
        border: string;
    }> = {
        coral: {
            bg: "bg-gradient-to-r from-coral-50 to-coral-100 dark:from-coral-900/30 dark:to-coral-900/40",
            icon: "bg-white dark:bg-gray-800 text-coral-600 dark:text-coral-400",
            text: "text-coral-800 dark:text-coral-300",
            border: "border-coral-200 dark:border-coral-800/50"
        },
        sunshine: {
            bg: "bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-900/40",
            icon: "bg-white dark:bg-gray-800 text-yellow-600 dark:text-yellow-400",
            text: "text-yellow-800 dark:text-yellow-300",
            border: "border-yellow-200 dark:border-yellow-800/50"
        },
        tropical: {
            bg: "bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-900/40",
            icon: "bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400",
            text: "text-emerald-800 dark:text-emerald-300",
            border: "border-emerald-200 dark:border-emerald-800/50"
        },
        bubblegum: {
            bg: "bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-900/40",
            icon: "bg-white dark:bg-gray-800 text-pink-600 dark:text-pink-400",
            text: "text-pink-800 dark:text-pink-300",
            border: "border-pink-200 dark:border-pink-800/50"
        },
        ocean: {
            bg: "bg-gradient-to-r from-sky-50 to-sky-100 dark:from-sky-900/30 dark:to-sky-900/40",
            icon: "bg-white dark:bg-gray-800 text-sky-600 dark:text-sky-400",
            text: "text-sky-800 dark:text-sky-300",
            border: "border-sky-200 dark:border-sky-800/50"
        },
        // Fallback option
        gray: {
            bg: "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-900/40",
            icon: "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400",
            text: "text-gray-800 dark:text-gray-300",
            border: "border-gray-200 dark:border-gray-800/50"
        }
    };

    const colors = colorClasses[stat.color] || colorClasses.gray; // Default to gray if color isn't found
    const Icon = stat.icon;

    return (
        <div className={`rounded-lg border ${colors.border} ${colors.bg} p-4 transition-all hover:shadow-sm`}>
            <div className="flex items-center">
                <div className={`w-10 h-10 rounded-md flex items-center justify-center ${colors.icon} shadow-sm`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="ml-4">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                    <p className={`text-xl font-bold ${colors.text}`}>{stat.value}</p>
                </div>
            </div>
        </div>
    );
};

export default ActivityStatsBar;
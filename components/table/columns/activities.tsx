"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
    ArrowUpDown,
    FileDown,
    Volume2,
    XCircle,
    CheckCircle2,
    Eye,
    CircleSlash,
    Circle,
    File,
    Calendar
} from "lucide-react";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import DataTableRowActions from "@/components/table/DataTableRowActions";
import { cn } from "@/lib/utils";
import { ActivityDifficulty, ActivityType, AgeRange } from "@prisma/client";
import { getFileDownloadUrl } from "@/lib/actions/file-download.action";
import { ActivityWithFiles } from "@/types/activity";

// Modern badge variants with more subtle, professional colors
const getDifficultyVariant = (difficulty: ActivityDifficulty) => {
    const variants = {
        BEGINNER: "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
        INTERMEDIATE: "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        ADVANCED: "bg-orange-50 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800",
        EXPERT: "bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800"
    };

    return variants[difficulty] || "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
};

const getTypeVariant = (type: ActivityType) => {
    const variants = {
        SPEECH: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        LANGUAGE: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
        COGNITIVE: "bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800",
        MOTOR: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
        SOCIAL: "bg-pink-50 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 border-pink-200 dark:border-pink-800",
        OTHER: "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
    };

    return variants[type] || variants.OTHER;
};

const getAgeRangeVariant = (ageRange: AgeRange) => {
    const variants = {
        TODDLER: "bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200 dark:border-sky-800",
        PRESCHOOL: "bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border-teal-200 dark:border-teal-800",
        CHILD: "bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800",
        TEENAGER: "bg-violet-50 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border-violet-200 dark:border-violet-800",
        ADULT: "bg-slate-50 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300 border-slate-200 dark:border-slate-800"
    };

    return variants[ageRange] || "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
};

// Redesigned DownloadButton component
const DownloadButton = ({ file, activityId }: {
    file: NonNullable<ActivityWithFiles['files']>[0],
    activityId: string
}) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadComplete, setDownloadComplete] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDownload = async () => {
        try {
            setIsDownloading(true);
            setError(null);

            const result = await getFileDownloadUrl({ fileId: file.id });

            if (result.success) {
                // Create a temporary link element
                const link = document.createElement('a');
                //@ts-ignore
                link.href = result.url;
                link.setAttribute('download', file.name);

                // Required for Firefox
                document.body.appendChild(link);

                // Trigger download
                link.click();

                // Cleanup
                document.body.removeChild(link);

                // Show success state briefly
                setTimeout(() => {
                    setIsDownloading(false);
                    setDownloadComplete(true);

                    setTimeout(() => {
                        setDownloadComplete(false);
                    }, 2000);
                }, 800);
            } else {
                // Handle error
                setError(result.error || "Download failed");
                setIsDownloading(false);
            }
        } catch (error) {
            console.error("Download failed:", error);
            setError("An unexpected error occurred");
            setIsDownloading(false);
        }
    };

    // Error state
    if (error) {
        return (
            <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 border-red-200 text-red-600 bg-red-50 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
            >
                <XCircle className="h-4 w-4" />
                <span className="ml-1 text-xs">Failed</span>
            </Button>
        );
    }

    // Loading state
    if (isDownloading) {
        return (
            <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 border-gray-200 dark:border-gray-700"
                disabled
            >
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 dark:border-blue-400 border-t-transparent" />
                <span className="ml-1 text-xs">Downloading...</span>
            </Button>
        );
    }

    // Success state
    if (downloadComplete) {
        return (
            <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 border-green-200 text-green-600 bg-green-50 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
            >
                <CheckCircle2 className="h-4 w-4" />
                <span className="ml-1 text-xs">Downloaded</span>
            </Button>
        );
    }

    // Default state
    return (
        <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:border-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-all"
            onClick={handleDownload}
        >
            <FileDown className="h-4 w-4" />
            <span className="text-xs">Download</span>
        </Button>
    );
};

interface ActivitiesColumnsProps {
    onDelete?: (value: ActivityWithFiles) => void;
    onView?: (value: ActivityWithFiles) => void;
    role?: string
}

export const activitiesColumns = ({
                                      onDelete,
                                      onView,
                                      role
                                  }: ActivitiesColumnsProps = {}): ColumnDef<ActivityWithFiles>[] => {
    // Define all the columns
    const columns: ColumnDef<ActivityWithFiles>[] = [
        {
            accessorKey: "name",
            header: ({column}) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                        Nome
                        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50"/>
                    </Button>
                );
            },
            cell: ({row}) => {
                const activity = row.original;
                return (
                    <div className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                        {activity.name}
                    </div>
                );
            },
        },
        {
            accessorKey: "type",
            header: "Tipo",
            cell: ({row}) => {
                const activity = row.original;
                return (
                    <div
                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getTypeVariant(activity.type)}`}>
                        {activity.type}
                    </div>
                );
            },
        },
        {
            accessorKey: "difficulty",
            header: "Dificuldade",
            cell: ({row}) => {
                const activity = row.original;
                return (
                    <div
                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getDifficultyVariant(activity.difficulty)}`}>
                        {activity.difficulty}
                    </div>
                );
            },
        },
        {
            accessorKey: "ageRange",
            header: "Faixa Etária",
            cell: ({row}) => {
                const activity = row.original;
                return (
                    <div
                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getAgeRangeVariant(activity.ageRange)}`}>
                        {activity.ageRange}
                    </div>
                );
            },
        },
        {
            accessorKey: "phoneme",
            header: ({column}) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                        Fonema
                        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50"/>
                    </Button>
                );
            },
            cell: ({row}) => {
                const activity = row.original;
                return activity.phoneme ? (
                    <div className="flex items-center">
                        <div
                            className="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 p-1.5 rounded-md mr-2">
                            <Volume2 className="h-3.5 w-3.5"/>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{activity.phoneme}</span>
                    </div>
                ) : (
                    <span className="text-gray-500 dark:text-gray-400 flex items-center">
            <CircleSlash className="h-3.5 w-3.5 mr-1.5"/>
            Não definido
          </span>
                );
            },
        },
        {
            accessorKey: "files",
            header: "Arquivos",
            cell: ({row}) => {
                const activity = row.original;
                const files = activity.files || [];
                const hasFiles = files.length > 0;

                if (!hasFiles) {
                    return (
                        <span className="text-gray-500 dark:text-gray-400 flex items-center">
              <XCircle className="h-3.5 w-3.5 mr-1.5"/>
              Sem arquivo
            </span>
                    );
                }

                // Make sure we have a valid file before passing it to the component
                if (files.length > 0 && files[0]) {
                    return <DownloadButton file={files[0]} activityId={activity.id}/>;
                }

                // Fallback in case of empty array with undefined first element
                return (
                    <span className="text-gray-500 dark:text-gray-400 flex items-center">
            <XCircle className="h-3.5 w-3.5 mr-1.5"/>
            Arquivo inválido
          </span>
                );
            },
        },
        {
            accessorKey: "createdAt",
            header: ({column}) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                        Data
                        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50"/>
                    </Button>
                );
            },
            cell: ({row}) => {
                const activity = row.original;
                return (
                    <div className="text-gray-600 dark:text-gray-400 text-sm flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-400 dark:text-gray-500"/>
                        {formatDateTime(activity.createdAt).dateOnly}
                    </div>
                );
            },
        },
        {
            id: "actions",
            cell: ({row}) => {
                return (
                    <DataTableRowActions
                        row={row}
                        onDelete={onDelete}
                        onView={onView}
                    />
                );
            },
        },


    ];


    return columns;
}
// "use client";
//
// import { ColumnDef } from "@tanstack/react-table";
// import { Button } from "@/components/ui/button";
// import {
//     ArrowUpDown,
//     FileDown,
//     Volume2,
//     XCircle,
//     CheckCircle2
// } from "lucide-react";
// import React, { useState } from "react";
// import { Badge } from "@/components/ui/badge";
// import { formatDateTime } from "@/lib/utils";
// import DataTableRowActions from "@/components/table/DataTableRowActions";
// import { cn } from "@/lib/utils";
// import { Activity as PrismaActivity, ActivityDifficulty, ActivityType, AgeRange } from "@prisma/client";
// import { getFileDownloadUrl } from "@/lib/actions/file-download.action";
// import { ActivityWithFiles } from "@/types/activity"; // Import from shared types
//
// // Helper function to get badge variants based on difficulty
// const getDifficultyVariant = (difficulty: ActivityDifficulty) => {
//     switch (difficulty) {
//         case "BEGINNER":
//             return "success";
//         case "INTERMEDIATE":
//             return "warning";
//         case "ADVANCED":
//             return "destructive";
//         default:
//             return "secondary";
//     }
// };
//
// // Helper function to get badge variants based on activity type
// const getTypeVariant = (type: ActivityType) => {
//     switch (type) {
//         default:
//             return "secondary";
//     }
// };
//
// const adminColumns: ColumnDef<ActivityWithFiles>[] = [
//     {
//         accessorKey: "isPublic",
//         header: "Visibility",
//         cell: ({ row }) => {
//             const activity = row.original;
//             return (
//                 <div className={cn(
//                     "flex items-center",
//                     activity.isPublic ? "text-green-600" : "text-slate-500"
//                 )}>
//                     <div className={cn(
//                         "h-2 w-2 rounded-full mr-2",
//                         activity.isPublic ? "bg-green-500" : "bg-slate-300"
//                     )} />
//                     {activity.isPublic ? "Public" : "Private"}
//                 </div>
//             );
//         },
//     },
// ];
//
// // Helper function to get badge variants based on age range
// const getAgeRangeVariant = (ageRange: AgeRange) => {
//     switch (ageRange) {
//         case "TODDLER":
//             return "success";
//         case "PRESCHOOL":
//             return "warning";
//         case "ADULT":
//             return "default";
//         default:
//             return "secondary";
//     }
// };
//
// // DownloadButton component with pre-signed URL support
// const DownloadButton = ({ file, activityId }: {
//     file: NonNullable<ActivityWithFiles['files']>[0],
//     activityId: string
// }) => {
//     const [isDownloading, setIsDownloading] = useState(false);
//     const [downloadComplete, setDownloadComplete] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//
//     const handleDownload = async () => {
//         try {
//             setIsDownloading(true);
//             setError(null);
//
//             const result = await getFileDownloadUrl({ fileId: file.id });
//
//             if (result.success) {
//                 // Create a temporary link element
//                 const link = document.createElement('a');
//                 //@ts-ignore
//                 link.href = result.url;
//
//                 // Ensure we have a valid string for the download attribute
//                 const safeFileName: string = typeof file.name === 'string' && file.name.trim() !== ''
//                     ? file.name
//                     : `activity-${activityId}.pdf`;
//
//                 link.setAttribute('download', safeFileName);
//
//                 // Required for Firefox
//                 document.body.appendChild(link);
//
//                 // Trigger download
//                 link.click();
//
//                 // Cleanup
//                 document.body.removeChild(link);
//
//                 // Show success state briefly
//                 setTimeout(() => {
//                     setIsDownloading(false);
//                     setDownloadComplete(true);
//
//                     setTimeout(() => {
//                         setDownloadComplete(false);
//                     }, 2000);
//                 }, 800);
//             } else {
//                 // Handle error
//                 setError(result.error || "Download failed");
//                 setIsDownloading(false);
//             }
//         } catch (error) {
//             console.error("Download failed:", error);
//             setError("An unexpected error occurred");
//             setIsDownloading(false);
//         }
//     };
//
//     // Error state
//     if (error) {
//         return (
//             <Button
//                 variant="outline"
//                 size="sm"
//                 className="flex items-center gap-1 bg-red-50 text-red-600 border-red-200"
//             >
//                 <XCircle className="h-4 w-4" />
//                 <span className="ml-1 text-xs">Failed</span>
//             </Button>
//         );
//     }
//
//     // Loading state
//     if (isDownloading) {
//         return (
//             <Button
//                 variant="outline"
//                 size="sm"
//                 className="flex items-center gap-1"
//                 disabled
//             >
//                 <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
//                 <span className="ml-1 text-xs">Downloading...</span>
//             </Button>
//         );
//     }
//
//     // Success state
//     if (downloadComplete) {
//         return (
//             <Button
//                 variant="outline"
//                 size="sm"
//                 className="flex items-center gap-1 bg-green-50 text-green-600 border-green-200"
//             >
//                 <CheckCircle2 className="h-4 w-4" />
//                 <span className="ml-1 text-xs">Downloaded</span>
//             </Button>
//         );
//     }
//
//     // Default state
//     return (
//         <Button
//             variant="outline"
//             size="sm"
//             className="flex items-center gap-1 transition-all hover:bg-primary hover:text-primary-foreground"
//             onClick={handleDownload}
//         >
//             <FileDown className="h-4 w-4" />
//             <span className="text-xs">Download</span>
//         </Button>
//     );
// };
//
// interface ActivitiesColumnsProps {
//     onDelete?: (value: ActivityWithFiles) => void;
//     onView?: (value: ActivityWithFiles) => void;
//     role?: string
// }
//
// export const activitiesColumns = ({
//                                       onDelete,
//                                       onView,
//                                       role
//                                   }: ActivitiesColumnsProps = {}): ColumnDef<ActivityWithFiles>[] => [
//     {
//         accessorKey: "name",
//         header: ({ column }) => {
//             return (
//                 <Button
//                     variant="ghost"
//                     onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//                     className="font-medium"
//                 >
//                     Name
//                     <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
//                 </Button>
//             );
//         },
//         cell: ({ row }) => {
//             const activity = row.original;
//             return (
//                 <div className="font-medium truncate max-w-[200px]">
//                     {activity.name}
//                 </div>
//             );
//         },
//     },
//     {
//         accessorKey: "type",
//         header: "Type",
//         cell: ({ row }) => {
//             const activity = row.original;
//             return (
//                 <Badge variant={getTypeVariant(activity.type) as any}>
//                     {activity.type}
//                 </Badge>
//             );
//         },
//     },
//     {
//         accessorKey: "difficulty",
//         header: "Difficulty",
//         cell: ({ row }) => {
//             const activity = row.original;
//             return (
//                 <Badge variant={getDifficultyVariant(activity.difficulty) as any}>
//                     {activity.difficulty}
//                 </Badge>
//             );
//         },
//     },
//     {
//         accessorKey: "ageRange",
//         header: "Age Range",
//         cell: ({ row }) => {
//             const activity = row.original;
//             return (
//                 <Badge variant={getAgeRangeVariant(activity.ageRange) as any}>
//                     {activity.ageRange}
//                 </Badge>
//             );
//         },
//     },
//     {
//         accessorKey: "phoneme",
//         header: ({ column }) => {
//             return (
//                 <Button
//                     variant="ghost"
//                     onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//                     className="font-medium"
//                 >
//                     Phoneme
//                     <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
//                 </Button>
//             );
//         },
//         cell: ({ row }) => {
//             const activity = row.original;
//             return activity.phoneme ? (
//                 <div className="flex items-center">
//                     <div className="bg-purple-100 text-purple-600 p-1 rounded-full mr-2">
//                         <Volume2 className="h-3.5 w-3.5" />
//                     </div>
//                     <span className="font-medium">{activity.phoneme}</span>
//                 </div>
//             ) : (
//                 <span className="text-muted-foreground">-</span>
//             );
//         },
//     },
//     {
//         accessorKey: "files",
//         header: "Files",
//         cell: ({ row }) => {
//             const activity = row.original;
//             const files = activity.files || [];
//             const hasFiles = files.length > 0;
//
//             if (!hasFiles) {
//                 return (
//                     <span className="text-muted-foreground flex items-center">
//                         <XCircle className="h-3.5 w-3.5 mr-1.5 opacity-70" />
//                         No files
//                     </span>
//                 );
//             }
//
//             // Make sure we have a valid file before passing it to the component
//             if (files.length > 0 && files[0]) {
//                 return <DownloadButton file={files[0]} activityId={activity.id} />;
//             }
//
//             // Fallback in case of empty array with undefined first element
//             return (
//                 <span className="text-muted-foreground flex items-center">
//                     <XCircle className="h-3.5 w-3.5 mr-1.5 opacity-70" />
//                     No valid files
//                 </span>
//             );
//         },
//     },
//
//
//
//     {
//         accessorKey: "isPublic",
//         header: "Visibility",
//         cell: ({ row }) => {
//             const activity = row.original;
//             return (
//                 <div className={cn(
//                     "flex items-center",
//                     activity.isPublic ? "text-green-600" : "text-slate-500"
//                 )}>
//                     <div className={cn(
//                         "h-2 w-2 rounded-full mr-2",
//                         activity.isPublic ? "bg-green-500" : "bg-slate-300"
//                     )} />
//                     {activity.isPublic ? "Public" : "Private"}
//                 </div>
//             );
//         },
//     },
//     {
//         accessorKey: "createdAt",
//         header: ({ column }) => {
//             return (
//                 <Button
//                     variant="ghost"
//                     onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//                     className="font-medium"
//                 >
//                     Created
//                     <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
//                 </Button>
//             );
//         },
//         cell: ({ row }) => {
//             const activity = row.original;
//             return (
//                 <div className="text-muted-foreground text-sm">
//                     {formatDateTime(activity.createdAt).dateOnly}
//                 </div>
//             );
//         },
//     },
//     {
//         id: "actions",
//         cell: ({ row }) => {
//             return (
//                 <DataTableRowActions
//                     row={row}
//                     onDelete={onDelete}
//                     onView={onView}
//                 />
//             );
//         },
//     },
// ];

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
    ArrowUpDown,
    FileDown,
    Volume2,
    XCircle,
    CheckCircle2
} from "lucide-react";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import DataTableRowActions from "@/components/table/DataTableRowActions";
import { cn } from "@/lib/utils";
import { Activity as PrismaActivity, ActivityDifficulty, ActivityType, AgeRange } from "@prisma/client";
import { getFileDownloadUrl } from "@/lib/actions/file-download.action";
import { ActivityWithFiles } from "@/types/activity"; // Import from shared types

// Helper function to get badge variants based on difficulty
const getDifficultyVariant = (difficulty: ActivityDifficulty) => {
    switch (difficulty) {
        case "BEGINNER":
            return "success";
        case "INTERMEDIATE":
            return "warning";
        case "ADVANCED":
            return "destructive";
        default:
            return "secondary";
    }
};

// Helper function to get badge variants based on activity type
const getTypeVariant = (type: ActivityType) => {
    switch (type) {
        default:
            return "secondary";
    }
};

// Helper function to get badge variants based on age range
const getAgeRangeVariant = (ageRange: AgeRange) => {
    switch (ageRange) {
        case "TODDLER":
            return "success";
        case "PRESCHOOL":
            return "warning";
        case "ADULT":
            return "default";
        default:
            return "secondary";
    }
};

// DownloadButton component with pre-signed URL support
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

                // Ensure we have a valid string for the download attribute
                const safeFileName: string = typeof file.name === 'string' && file.name.trim() !== ''
                    ? file.name
                    : `activity-${activityId}.pdf`;

                link.setAttribute('download', safeFileName);

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
                className="flex items-center gap-1 bg-red-50 text-red-600 border-red-200"
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
                className="flex items-center gap-1"
                disabled
            >
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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
                className="flex items-center gap-1 bg-green-50 text-green-600 border-green-200"
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
            className="flex items-center gap-1 transition-all hover:bg-primary hover:text-primary-foreground"
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
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="font-medium"
                    >
                        Name
                        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const activity = row.original;
                return (
                    <div className="font-medium truncate max-w-[200px]">
                        {activity.name}
                    </div>
                );
            },
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => {
                const activity = row.original;
                return (
                    <Badge variant={getTypeVariant(activity.type) as any}>
                        {activity.type}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "difficulty",
            header: "Difficulty",
            cell: ({ row }) => {
                const activity = row.original;
                return (
                    <Badge variant={getDifficultyVariant(activity.difficulty) as any}>
                        {activity.difficulty}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "ageRange",
            header: "Age Range",
            cell: ({ row }) => {
                const activity = row.original;
                return (
                    <Badge variant={getAgeRangeVariant(activity.ageRange) as any}>
                        {activity.ageRange}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "phoneme",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="font-medium"
                    >
                        Phoneme
                        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const activity = row.original;
                return activity.phoneme ? (
                    <div className="flex items-center">
                        <div className="bg-purple-100 text-purple-600 p-1 rounded-full mr-2">
                            <Volume2 className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-medium">{activity.phoneme}</span>
                    </div>
                ) : (
                    <span className="text-muted-foreground">-</span>
                );
            },
        },
        {
            accessorKey: "files",
            header: "Files",
            cell: ({ row }) => {
                const activity = row.original;
                const files = activity.files || [];
                const hasFiles = files.length > 0;

                if (!hasFiles) {
                    return (
                        <span className="text-muted-foreground flex items-center">
                            <XCircle className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                            No files
                        </span>
                    );
                }

                // Make sure we have a valid file before passing it to the component
                if (files.length > 0 && files[0]) {
                    return <DownloadButton file={files[0]} activityId={activity.id} />;
                }

                // Fallback in case of empty array with undefined first element
                return (
                    <span className="text-muted-foreground flex items-center">
                        <XCircle className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                        No valid files
                    </span>
                );
            },
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="font-medium"
                    >
                        Created
                        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const activity = row.original;
                return (
                    <div className="text-muted-foreground text-sm">
                        {formatDateTime(activity.createdAt).dateOnly}
                    </div>
                );
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
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

    // If the user role is ADMIN, add the visibility column
    if (role === 'ADMIN') {
        // Find the position to insert the visibility column (before createdAt)
        const createdAtIndex = columns.findIndex(col => col.header === "createdAt");
        const insertIndex = createdAtIndex !== -1 ? createdAtIndex : columns.length - 1;

        // Create the visibility column definition
        const visibilityColumn: ColumnDef<ActivityWithFiles> = {
            accessorKey: "isPublic",
            header: "Visibility",
            cell: ({ row }) => {
                const activity = row.original;
                return (
                    <div className={cn(
                        "flex items-center",
                        activity.isPublic ? "text-green-600" : "text-slate-500"
                    )}>
                        <div className={cn(
                            "h-2 w-2 rounded-full mr-2",
                            activity.isPublic ? "bg-green-500" : "bg-slate-300"
                        )} />
                        {activity.isPublic ? "Public" : "Private"}
                    </div>
                );
            },
        };

        // Insert the visibility column at the desired position
        columns.splice(insertIndex, 0, visibilityColumn);
    }

    return columns;
};
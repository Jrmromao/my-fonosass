import React, { useState, useMemo, useCallback, useTransition, useEffect } from 'react';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FileDown, Volume2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import SvgImage from "@/components/SVGImage";
import AppleComponent from "@/components/AppleComponent";
import { AppleType } from "@/types/types";
import { Activity, ActivityType, ActivityDifficulty, AgeRange } from "@prisma/client";
import { getActivitiesByPhoneme } from "@/lib/actions/activity.action";
import { getFileDownloadUrl } from "@/lib/actions/file-download.action";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Activity file type
interface ActivityFile {
    id: string;
    name: string;
    activityId: string;
    s3Key: string;
    s3Url: string;
    fileType: string;
    sizeInBytes: number;
    uploadedById: string;
    createdAt: Date;
    updatedAt: Date;
}

// Define an extended Activity type that includes files
interface ActivityWithFiles extends Activity {
    files?: ActivityFile[];
}

// Constants for apple data to prevent recreation
const PHONEME_MESSAGES: { [key: string]: string } = {
    "B": "A fresh red apple that recently fell from the tree.",
    "P": "This apple has a beautiful crimson color.",
    "T": "A crisp, tart apple perfect for baking.",
    "D": "A dark red apple with a sweet taste.",
    "K": "A firm apple with a balanced flavor.",
    "G": "A green apple with a sour punch.",
    "F": "A flawless apple with shiny skin.",
    "V": "A perfectly ripe apple with a mix of red and yellow.",
    "S": "A small, sweet apple great for snacking.",
    "Z": "A zesty apple with bright flavor.",
    "SH": "A shiny apple with smooth skin.",
    "CH": "A chunky apple perfect for pies.",
    "J": "A juicy apple that drips when bitten.",
    "TH": "A thick-skinned apple that stores well.",
    "DH": "A delightfully tasty heritage variety.",
    "M": "A magnificent apple from a special tree.",
    "N": "A nutritious apple packed with vitamins.",
    "NG": "An elongated apple variety from distant orchards.",
    "L": "A large apple that takes two hands to hold.",
    "R": "A ruby-red apple with rich flavor.",
    "W": "A wonderful apple that tastes like honey.",
    "Y": "A yellow apple with a hint of sweetness.",
    "H": "A healthy apple grown without pesticides.",
    "Be": "A beautiful speckled apple variety."
};

// Badge color utility functions
const getBadgeVariant = {
    difficulty: (difficulty: ActivityDifficulty) => {
        const variants: { [key: string]: string } = {
            "BEGINNER": "success",
            "INTERMEDIATE": "warning",
            "ADVANCED": "destructive",
            "default": "secondary"
        };
        return variants[difficulty] || variants.default;
    },
    type: (type: ActivityType) => "secondary",
    ageRange: (ageRange: AgeRange) => {
        const variants: { [key: string]: string } = {
            "TODDLER": "success",
            "PRESCHOOL": "warning",
            "ADULT": "default",
            "default": "secondary"
        };
        return variants[ageRange] || variants.default;
    }
};

// Use dynamic import with SSR disabled for this component
// This ensures it only renders on the client
const SVGRender = () => {
    const [isMounted, setIsMounted] = useState(false);
    const [selectedApple, setSelectedApple] = useState<AppleType | null>(null);
    const [activities, setActivities] = useState<ActivityWithFiles[]>([]);
    const [isPending, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(false);
    const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
    const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
    const [downloadError, setDownloadError] = useState<string | null>(null);
    const router = useRouter();

    // Client-side only effect
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Close modal function
    const closeModal = useCallback(() => {
        setSelectedApple(null);
        setActivities([]);
        setDownloadingFileId(null);
        setDownloadSuccess(null);
        setDownloadError(null);
    }, []);

    // Get phoneme message - now uses memoized constant
    const getAppleMessage = useCallback((phoneme: string) => {
        return PHONEME_MESSAGES[phoneme] || `An apple representing the "${phoneme}" sound.`;
    }, []);

    // Function to download a file
    const handleFileDownload = useCallback(async (fileId: string, fileName: string) => {
        if (!isMounted) return; // Safety check

        try {
            setDownloadingFileId(fileId);
            setDownloadError(null);

            const result = await getFileDownloadUrl({ fileId });

            if (result.success) {
                // Create a temporary link element
                const link = document.createElement('a');
                //@ts-ignore
                link.href = result.url;
                const safeFileName = fileName || `activity-${fileId}.pdf`;
                link.setAttribute('download', safeFileName);

                // Required for Firefox
                document.body.appendChild(link);

                // Trigger download
                link.click();

                // Cleanup
                document.body.removeChild(link);

                // Show success state briefly
                setDownloadSuccess(fileId);
                setTimeout(() => {
                    if (isMounted) { // Check if component is still mounted
                        setDownloadSuccess(null);
                    }
                }, 2000);
            } else {
                setDownloadError(fileId);
                setTimeout(() => {
                    if (isMounted) { // Check if component is still mounted
                        setDownloadError(null);
                    }
                }, 3000);
            }
        } catch (error) {
            console.error("Download failed:", error);
            setDownloadError(fileId);
            setTimeout(() => {
                if (isMounted) { // Check if component is still mounted
                    setDownloadError(null);
                }
            }, 3000);
        } finally {
            setDownloadingFileId(null);
        }
    }, [isMounted]);

    // Handle apple click with server action call
    const handleAppleClick = useCallback((apple: AppleType) => {
        if (!isMounted) return; // Safety check

        setIsLoading(true);
        setSelectedApple(apple);

        startTransition(async () => {
            try {
                // Call the server action to get activities for this phoneme
                const result = await getActivitiesByPhoneme({
                    phoneme: apple.phoneme,
                    includePrivate: false,
                    limit: 5 // Limit to 5 activities for now
                });

                if (isMounted) {
                    setActivities(result.items as unknown as ActivityWithFiles[]);
                }
            } catch (error) {
                console.error("Error fetching activities:", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        });
    }, [isMounted]);

    // Memoized apple arrays - static values
    const groundApples = useMemo(() => [
        {id: "ground-1", x: 350, y: 680, rotate: 15, scale: 1.1, phoneme: "Be", size: 20},
        {id: "ground-2", x: 390, y: 680, rotate: -10, scale: 0.9, phoneme: "B", size: 22},
        {id: "ground-3", x: 350, y: 680, rotate: 5, scale: 1, phoneme: "B", size: 18},
        {id: "ground-4", x: 450, y: 680, rotate: -20, scale: 1.2, phoneme: "B", size: 20},
        {id: "ground-5", x: 500, y: 680, rotate: 8, scale: 0.95, phoneme: "B", size: 23},
    ], []);

    const treeApples = useMemo(() => [
        {id: "tree-1", x: 350, y: 145, size: 27, phoneme: "B"},
        {id: "tree-2", x: 387, y: 180, size: 19, phoneme: "P"},
        {id: "tree-3", x: 450, y: 160, size: 30, phoneme: "M"},
        {id: "tree-4", x: 520, y: 125, size: 22, phoneme: "T"},
        {id: "tree-5", x: 590, y: 170, size: 28, phoneme: "D"},
        {id: "tree-6", x: 670, y: 140, size: 25, phoneme: "K"},
        {id: "tree-7", x: 340, y: 230, size: 18, phoneme: "G"},
        {id: "tree-8", x: 410, y: 250, size: 28, phoneme: "F"},
        {id: "tree-9", x: 480, y: 220, size: 22, phoneme: "V"},
        {id: "tree-10", x: 550, y: 240, size: 24, phoneme: "S"},
        {id: "tree-11", x: 620, y: 210, size: 29, phoneme: "Z"},
        {id: "tree-12", x: 370, y: 290, size: 26, phoneme: "SH"},
        {id: "tree-13", x: 440, y: 290, size: 25, phoneme: "CH"},
        {id: "tree-14", x: 510, y: 280, size: 27, phoneme: "J"},
        {id: "tree-15", x: 580, y: 300, size: 17, phoneme: "L"},
        {id: "tree-16", x: 650, y: 270, size: 24, phoneme: "R"},
        {id: "tree-17", x: 400, y: 350, size: 27, phoneme: "W"},
        {id: "tree-18", x: 470, y: 330, size: 30, phoneme: "H"},
        {id: "tree-19", x: 540, y: 340, size: 22, phoneme: "Y"},
        {id: "tree-20", x: 660, y: 360, size: 25, phoneme: "NG"},
        {id: "tree-21", x: 730, y: 330, size: 23, phoneme: "TH"},
        {id: "tree-22", x: 350, y: 410, size: 17, phoneme: "DH"},
        {id: "tree-23", x: 600, y: 390, size: 30, phoneme: "N"}
    ], []);

    // Extract UI Components for cleaner JSX
    const ActivityItem = useCallback(({ activity }: { activity: ActivityWithFiles }) => {
        const mainFile = activity.files?.[0];
        return (
            <li className="bg-slate-50 p-4 rounded-lg border border-slate-100 transition-all hover:shadow-sm">
                <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-slate-800">{activity.name}</h4>

                    {/* Files download button - only shown if activity has files */}
                    {mainFile && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={cn(
                                            "ml-2 h-8 px-2 flex items-center gap-1",
                                            downloadSuccess === mainFile.id && "bg-green-50 text-green-600 border-green-200",
                                            downloadError === mainFile.id && "bg-red-50 text-red-600 border-red-200"
                                        )}
                                        onClick={() => handleFileDownload(mainFile.id, mainFile.name)}
                                        disabled={downloadingFileId === mainFile.id}
                                    >
                                        {downloadingFileId === mainFile.id ? (
                                            <>
                                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                <span className="text-xs">Downloading...</span>
                                            </>
                                        ) : downloadSuccess === mainFile.id ? (
                                            <>
                                                <CheckCircle2 className="h-3 w-3" />
                                                <span className="text-xs">Downloaded</span>
                                            </>
                                        ) : downloadError === mainFile.id ? (
                                            <>
                                                <XCircle className="h-3 w-3" />
                                                <span className="text-xs">Failed</span>
                                            </>
                                        ) : (
                                            <>
                                                <FileDown className="h-3 w-3" />
                                                <span className="text-xs">PDF</span>
                                            </>
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Download activity PDF</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>

                <p className="text-sm text-slate-600 mt-1 line-clamp-2">{activity.description}</p>

                <div className="flex gap-2 mt-3">
                    <Badge variant={getBadgeVariant.type(activity.type) as any} className="text-xs font-normal">
                        {activity.type}
                    </Badge>
                    <Badge variant={getBadgeVariant.difficulty(activity.difficulty) as any} className="text-xs font-normal">
                        {activity.difficulty}
                    </Badge>
                    <Badge variant={getBadgeVariant.ageRange(activity.ageRange) as any} className="text-xs font-normal">
                        {activity.ageRange}
                    </Badge>
                </div>
            </li>
        );
    }, [downloadSuccess, downloadError, downloadingFileId, handleFileDownload]);

    // Extract loading and empty states for cleaner JSX
    const LoadingState = () => (
        <div className="flex justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
    );

    const EmptyState = () => (
        <div className="text-center py-8 px-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <XCircle className="h-8 w-8 mx-auto text-slate-300 mb-2" />
            <p className="text-slate-500 mb-1">No activities found</p>
            <p className="text-sm text-slate-400">There are no activities for this phoneme yet.</p>
        </div>
    );

    // Show loading state until client-side hydration is complete
    if (!isMounted) {
        return (
            <div className="w-full aspect-[10/7] flex items-center justify-center bg-slate-50">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }
    // w-full aspect-[10/7] relative
    return (
        <div className="relative">
            <div className="absolute inset-0">
                <svg
                    viewBox="0 0 1100 900"
                    preserveAspectRatio="xMidYMid meet"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                    style={{ touchAction: 'none' }}
                >
                    <SvgImage />

                    {/* Render tree apples */}
                    {treeApples.map((apple) => (
                        <AppleComponent
                            key={apple.id}
                            {...apple}
                            handleAppleClick={() => handleAppleClick(apple)}
                        />
                    ))}

                    {/* Render ground apples */}
                    {groundApples.map((apple) => (
                        <AppleComponent
                            key={apple.id}
                            {...apple}
                            handleAppleClick={() => handleAppleClick(apple)}
                        />
                    ))}
                </svg>
            </div>

            {/* Modal dialog with activities */}
            <AlertDialog open={selectedApple !== null} onOpenChange={closeModal}>
                <AlertDialogContent className="max-w-md max-h-[80vh] overflow-auto">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <div className="bg-purple-100 text-purple-600 p-1 rounded-full">
                                <Volume2 className="h-4 w-4" />
                            </div>
                            {selectedApple ? `Phoneme "${selectedApple.phoneme}"` : 'Apple'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-600">
                            {selectedApple && getAppleMessage(selectedApple.phoneme)}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-2">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-medium text-slate-800">Activities</h3>
                            {activities.length > 0 && (
                                <Badge variant="outline" className="bg-primary/5">
                                    {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
                                </Badge>
                            )}
                        </div>

                        {isPending || isLoading ? (
                            <LoadingState />
                        ) : activities.length > 0 ? (
                            <ul className="space-y-3">
                                {activities.map((activity) => (
                                    <ActivityItem key={activity.id} activity={activity} />
                                ))}
                            </ul>
                        ) : (
                            <EmptyState />
                        )}
                    </div>

                    <AlertDialogFooter className="pt-2 gap-2">
                        <AlertDialogCancel className="mt-0">Close</AlertDialogCancel>
                        {activities.length > 0 && (
                            <Button variant="default" className="gap-1" onClick={() => router.push(`/dashboard/games`)}>
                                <ExternalLink className="h-4 w-4" />
                                View All Activities
                            </Button>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

// Export a dynamic component with SSR disabled
export default dynamic(() => Promise.resolve(SVGRender), { ssr: false });


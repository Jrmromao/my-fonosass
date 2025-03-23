import React, { useState, useMemo, useCallback, useTransition } from 'react';
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

// Define an extended Activity type that includes files
interface ActivityWithFiles extends Activity {
    files?: Array<{
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
    }>;
}

const SVGRender = () => {
    const [selectedApple, setSelectedApple] = useState<AppleType | null>(null);
    const [activities, setActivities] = useState<ActivityWithFiles[]>([]);
    const [isPending, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(false);
    const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
    const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
    const [downloadError, setDownloadError] = useState<string | null>(null);

    // Memoize the close function
    const closeModal = useCallback(() => {
        setSelectedApple(null);
        setActivities([]);
        setDownloadingFileId(null);
        setDownloadSuccess(null);
        setDownloadError(null);
    }, []);

    // Memoize the random number generator to ensure stable reference
    const getRandomNumber = useCallback((min: number, max: number) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }, []);

    // Memoize the message function to prevent recreation on render
    const getAppleMessage = useCallback((phoneme: string) => {
        const messages: { [key: string]: string } = {
            // Plosives
            "B": "A fresh red apple that recently fell from the tree.",
            "P": "This apple has a beautiful crimson color.",
            "T": "A crisp, tart apple perfect for baking.",
            "D": "A dark red apple with a sweet taste.",
            "K": "A firm apple with a balanced flavor.",
            "G": "A green apple with a sour punch.",

            // Fricatives
            "F": "A flawless apple with shiny skin.",
            "V": "A perfectly ripe apple with a mix of red and yellow.",
            "S": "A small, sweet apple great for snacking.",
            "Z": "A zesty apple with bright flavor.",
            "SH": "A shiny apple with smooth skin.",
            "CH": "A chunky apple perfect for pies.",
            "J": "A juicy apple that drips when bitten.",
            "TH": "A thick-skinned apple that stores well.",
            "DH": "A delightfully tasty heritage variety.",

            // Sonorants
            "M": "A magnificent apple from a special tree.",
            "N": "A nutritious apple packed with vitamins.",
            "NG": "An elongated apple variety from distant orchards.",
            "L": "A large apple that takes two hands to hold.",
            "R": "A ruby-red apple with rich flavor.",
            "W": "A wonderful apple that tastes like honey.",
            "Y": "A yellow apple with a hint of sweetness.",
            "H": "A healthy apple grown without pesticides.",

            // Special phonemes
            "Be": "A beautiful speckled apple variety.",
        };

        // Return matching message or default if phoneme not found
        return messages[phoneme] || `An apple representing the "${phoneme}" sound.`;
    }, []);

    // Function to download a file
    const handleFileDownload = async (fileId: string, fileName: string) => {
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
                    setDownloadSuccess(null);
                }, 2000);
            } else {
                setDownloadError(fileId);
                setTimeout(() => {
                    setDownloadError(null);
                }, 3000);
            }
        } catch (error) {
            console.error("Download failed:", error);
            setDownloadError(fileId);
            setTimeout(() => {
                setDownloadError(null);
            }, 3000);
        } finally {
            setDownloadingFileId(null);
        }
    };

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

    // Helper function to get badge variants based on type
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

    // Memoize the groundApples array - only created once
    const groundApples = useMemo(() => [
        {id: "ground-1", x: 350, y: 680, rotate: 15, scale: 1.1, phoneme: "Be", size: getRandomNumber(17, 30)},
        {id: "ground-2", x: 390, y: 680, rotate: -10, scale: 0.9, phoneme: "B", size: getRandomNumber(17, 30)},
        {id: "ground-3", x: 350, y: 680, rotate: 5, scale: 1, phoneme: "B", size: getRandomNumber(17, 30)},
        {id: "ground-4", x: 450, y: 680, rotate: -20, scale: 1.2, phoneme: "B", size: getRandomNumber(17, 30)},
        {id: "ground-5", x: 500, y: 680, rotate: 8, scale: 0.95, phoneme: "B", size: getRandomNumber(17, 30)},
    ], [getRandomNumber]); // Depends only on the getRandomNumber function

    // Memoize the treeApples array - only created once
    const treeApples = useMemo(() => [
        {id: "tree-1", x: 350, y: 145, size: getRandomNumber(17, 35), phoneme: "B"},
        {id: "tree-2", x: 387, y: 180, size: getRandomNumber(17, 35), phoneme: "P"},
        {id: "tree-3", x: 450, y: 160, size: getRandomNumber(17, 35), phoneme: "M"},
        {id: "tree-4", x: 520, y: 125, size: getRandomNumber(17, 35), phoneme: "T"},
        {id: "tree-5", x: 590, y: 170, size: getRandomNumber(17, 30), phoneme: "D"},
        {id: "tree-6", x: 670, y: 140, size: getRandomNumber(17, 30), phoneme: "K"},
        {id: "tree-7", x: 340, y: 230, size: getRandomNumber(17, 30), phoneme: "G"},
        {id: "tree-8", x: 410, y: 250, size: getRandomNumber(17, 30), phoneme: "F"},
        {id: "tree-9", x: 480, y: 220, size: getRandomNumber(17, 30), phoneme: "V"},
        {id: "tree-10", x: 550, y: 240, size: getRandomNumber(17, 30), phoneme: "S"},
        {id: "tree-11", x: 620, y: 210, size: getRandomNumber(17, 30), phoneme: "Z"},
        {id: "tree-12", x: 370, y: 290, size: getRandomNumber(17, 30), phoneme: "SH"},
        {id: "tree-13", x: 440, y: 290, size: getRandomNumber(17, 30), phoneme: "CH"},
        {id: "tree-14", x: 510, y: 280, size: getRandomNumber(17, 30), phoneme: "J"},
        {id: "tree-15", x: 580, y: 300, size: getRandomNumber(17, 30), phoneme: "L"},
        {id: "tree-16", x: 650, y: 270, size: getRandomNumber(17, 30), phoneme: "R"},
        {id: "tree-17", x: 400, y: 350, size: getRandomNumber(17, 30), phoneme: "W"},
        {id: "tree-18", x: 470, y: 330, size: getRandomNumber(17, 30), phoneme: "H"},
        {id: "tree-19", x: 540, y: 340, size: getRandomNumber(17, 30), phoneme: "Y"},
        {id: "tree-20", x: 660, y: 360, size: getRandomNumber(17, 30), phoneme: "NG"},
        {id: "tree-21", x: 730, y: 330, size: getRandomNumber(17, 30), phoneme: "TH"},
        {id: "tree-22", x: 350, y: 410, size: getRandomNumber(17, 30), phoneme: "DH"},
        {id: "tree-23", x: 600, y: 390, size: getRandomNumber(17, 30), phoneme: "N"}
    ], [getRandomNumber]); // Depends only on the getRandomNumber function

    // Handle apple click with server action call
    const handleAppleClickForApple = useCallback((apple: AppleType) => {
        return () => {
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

                    setActivities(result.items as unknown as ActivityWithFiles[]);
                } catch (error) {
                    console.error("Error fetching activities:", error);
                } finally {
                    setIsLoading(false);
                }
            });
        };
    }, []);

    return (
        <div className="w-full aspect-[10/7] relative">
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
                            handleAppleClick={handleAppleClickForApple(apple)}
                        />
                    ))}

                    {/* Render ground apples */}
                    {groundApples.map((apple) => (
                        <AppleComponent
                            key={apple.id}
                            {...apple}
                            handleAppleClick={handleAppleClickForApple(apple)}
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
                            <div className="flex justify-center py-8">
                                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                            </div>
                        ) : activities.length > 0 ? (
                            <ul className="space-y-3">
                                {activities.map((activity) => (
                                    <li key={activity.id} className="bg-slate-50 p-4 rounded-lg border border-slate-100 transition-all hover:shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-semibold text-slate-800">{activity.name}</h4>

                                            {/* Files download button - only shown if activity has files */}
                                            {activity.files && activity.files.length > 0 && activity.files[0] && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className={cn(
                                                                    "ml-2 h-8 px-2 flex items-center gap-1",
                                                                    downloadSuccess === activity.files[0].id && "bg-green-50 text-green-600 border-green-200",
                                                                    downloadError === activity.files[0].id && "bg-red-50 text-red-600 border-red-200"
                                                                )}
                                                                onClick={() => {
                                                                    const file = activity.files?.[0];
                                                                    if (file?.id && file?.name) {
                                                                        handleFileDownload(file.id, file.name);
                                                                    }
                                                                }}

                                                                disabled={downloadingFileId === activity.files[0].id}
                                                            >
                                                                {downloadingFileId === activity.files[0].id ? (
                                                                    <>
                                                                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                                        <span className="text-xs">Downloading...</span>
                                                                    </>
                                                                ) : downloadSuccess === activity.files[0].id ? (
                                                                    <>
                                                                        <CheckCircle2 className="h-3 w-3" />
                                                                        <span className="text-xs">Downloaded</span>
                                                                    </>
                                                                ) : downloadError === activity.files[0].id ? (
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
                                            <Badge variant={getTypeVariant(activity.type) as any} className="text-xs font-normal">
                                                {activity.type}
                                            </Badge>
                                            <Badge variant={getDifficultyVariant(activity.difficulty) as any} className="text-xs font-normal">
                                                {activity.difficulty}
                                            </Badge>
                                            <Badge variant={getAgeRangeVariant(activity.ageRange) as any} className="text-xs font-normal">
                                                {activity.ageRange}
                                            </Badge>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-8 px-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                <XCircle className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                                <p className="text-slate-500 mb-1">No activities found</p>
                                <p className="text-sm text-slate-400">There are no activities for this phoneme yet.</p>
                            </div>
                        )}
                    </div>

                    <AlertDialogFooter className="pt-2 gap-2">
                        <AlertDialogCancel className="mt-0">Close</AlertDialogCancel>
                        {activities.length > 0 && (
                            <Button variant="default" className="gap-1">
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

export default SVGRender;
import React from 'react'
import {
    AlertDialog, AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {BookOpen, CheckCircle2, ExternalLink, FileDown, Volume2, X, XCircle} from "lucide-react";
import {PHONEME_MESSAGES} from "@/components/ballons/constants";
import {Badge} from "@/components/ui/badge";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {getBadgeVariant} from "@/components/ballons/utils";
import {useRouter} from "next/navigation";
import {ActivityWithFiles} from "@/types/activity";


interface PhonemeDialogProps {
    setDialogOpen: (open: boolean) => void;
    dialogOpen: boolean;
    activeColor: string;
    activeTitle: string;
    activities: ActivityWithFiles[];
    isLoading: boolean;
    isPending: boolean;
    downloadingFileId: string | null;
    downloadSuccess: string | null;
    downloadError: string | null;
    handleFileDownload: (fileId: string, fileName: string) => void;
    handleCloseDialog: () => void;
    type: string;

}


function PhonemeDialog({setDialogOpen, dialogOpen, activeTitle, activeColor,
    activities,
    type = "phoneme",
    isLoading,
    isPending,
    downloadingFileId,
    downloadSuccess,
    downloadError,
    handleFileDownload,
    handleCloseDialog,
}: PhonemeDialogProps) {


    const router = useRouter()

    return (
        <>
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent className="max-w-md max-h-[80vh] overflow-auto rounded-xl border-0 shadow-lg">
                    <AlertDialogHeader className="pb-3 border-b">
                        <AlertDialogTitle className="flex items-center gap-2 text-xl">
                            <div
                                className="p-2 rounded-full flex items-center justify-center"
                                style={{backgroundColor: `${activeColor}20`}}
                            >
                                <Volume2 className="h-5 w-5" style={{color: activeColor}}/>
                            </div>
                            {type === "phoneme" ? <span>Fonema /{activeTitle}/</span>  : <span>Exercícios para {activeTitle}</span>}




                        </AlertDialogTitle>
                        {type === "phoneme" && <AlertDialogDescription className="text-slate-600">
                            {PHONEME_MESSAGES[activeTitle]}
                        </AlertDialogDescription>}
                    </AlertDialogHeader>

                    {/* Phoneme info section */}
                    <div className="flex items-center justify-between py-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-14 h-14 rounded-full shadow-md flex items-center justify-center relative"
                                style={{backgroundColor: `${activeColor}15`}}
                            >
                                <div
                                    className="w-10 h-10 rounded-full absolute"
                                    style={{backgroundColor: activeColor}}
                                ></div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-500">{type === "phoneme" ? "Cor do Balão" : "Cor da Caixa"}</div>

                            </div>
                        </div>

                    </div>

                    {/* Activities section */}
                    <div className="py-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-primary/70"/>
                                Activities
                            </h3>
                            {activities.length > 0 && (
                                <Badge variant="outline" className="bg-primary/5 px-3 py-1 rounded-full">
                                    {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
                                </Badge>
                            )}
                        </div>

                        {isPending || isLoading ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-3">
                                <div
                                    className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full"></div>
                                <p className="text-sm text-slate-500">Loading activities...</p>
                            </div>
                        ) : activities.length > 0 ? (
                            <ul className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                {activities.map((activity) => (
                                    <li key={activity.id}
                                        className="bg-slate-50 p-4 rounded-xl border border-slate-100 transition-all hover:bg-slate-100 hover:border-slate-200">

                                        <div className="flex justify-between items-start">
                                            <h4 className="font-semibold text-slate-800">{activity.name}</h4>

                                            {/* Files download button - only shown if activity has files */}
                                            {activity.files?.[0] && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className={cn(
                                                                    "ml-2 h-8 px-2 flex items-center gap-1 rounded-full transition-all",
                                                                    downloadSuccess === activity.files[0].id && "bg-green-50 text-green-600 border-green-200",
                                                                    downloadError === activity.files[0].id && "bg-red-50 text-red-600 border-red-200"
                                                                )}
                                                                disabled={downloadingFileId === activity.files?.[0]?.id}
                                                                onClick={() => {
                                                                    if (activity.files?.[0]?.id) {
                                                                        handleFileDownload(activity.files[0].id, `${activity.name}.pdf`);
                                                                    }
                                                                }}
                                                            >
                                                                {downloadingFileId === activity.files?.[0]?.id ? (
                                                                    <>
                                                                        <div
                                                                            className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"/>
                                                                        <span className="text-xs">Downloading...</span>
                                                                    </>
                                                                ) : downloadSuccess === activity.files?.[0]?.id ? (
                                                                    <>
                                                                        <CheckCircle2 className="h-3 w-3"/>
                                                                        <span className="text-xs">Downloaded</span>
                                                                    </>
                                                                ) : downloadError === activity.files?.[0]?.id ? (
                                                                    <>
                                                                        <XCircle className="h-3 w-3"/>
                                                                        <span className="text-xs">Failed</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <FileDown className="h-3 w-3"/>
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

                                        <p className="text-sm text-slate-600 mt-2 line-clamp-2">{activity.description}</p>

                                        <div className="flex gap-2 mt-3 flex-wrap">
                                            <Badge variant={getBadgeVariant.type(activity.type) as any}
                                                   className="text-xs font-normal px-2.5 py-1 rounded-full">
                                                {activity.type}
                                            </Badge>
                                            <Badge variant={getBadgeVariant.difficulty(activity.difficulty) as any}
                                                   className="text-xs font-normal px-2.5 py-1 rounded-full">
                                                {activity.difficulty}
                                            </Badge>
                                            <Badge variant={getBadgeVariant.ageRange(activity.ageRange) as any}
                                                   className="text-xs font-normal px-2.5 py-1 rounded-full">
                                                {activity.ageRange}
                                            </Badge>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div
                                className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <div
                                    className="bg-slate-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <XCircle className="h-8 w-8 text-slate-400"/>
                                </div>
                                <p className="text-slate-700 font-medium mb-1">No activities found</p>
                                <p className="text-sm text-slate-500">There are no activities for this phoneme yet.</p>
                            </div>
                        )}
                    </div>

                    <AlertDialogFooter className="pt-3 gap-3 border-t">
                        <AlertDialogAction
                            onClick={handleCloseDialog}
                            className="px-5 py-2.5 bg-white rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all flex items-center w-full sm:w-auto justify-center gap-1.5 mt-0"
                        >
                            <X className="h-4 w-4"/>
                            Close
                        </AlertDialogAction>
                        {activities.length > 0 && (
                            <Button
                                variant="default"
                                style={{backgroundColor: activeColor}}
                                className={`px-5 py-2.5 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center w-full sm:w-auto justify-center gap-1.5 ${activeColor}`}
                                onClick={() => router.push(`/dashboard/games`)}
                            >
                                <ExternalLink className="h-4 w-4"/>
                                View All Activities
                            </Button>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


        </>
    )
}

export default PhonemeDialog

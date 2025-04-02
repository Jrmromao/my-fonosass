import React, { useCallback, useState, useRef, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle2, ExternalLink, FileDown, Volume2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBalloonAnimation } from './useBalloonAnimation';
import {ActivityWithFiles, Balloon, BalloonFieldProps} from './types';
import { getFileDownloadUrl } from '@/lib/actions/file-download.action';
import { colorNames, PHONEME_MESSAGES } from './constants';
import {Badge} from "@/components/ui/badge";

const BalloonField: React.FC<BalloonFieldProps> = ({
                                                       balloonCount = 23,
                                                       title = "Phoneme Pop!",
                                                       description = "Pop balloons to learn phonemes",
                                                       onBalloonPopped,
                                                   }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [activeColor, setActiveColor] = useState("");
    const [poppedBalloonId, setPoppedBalloonId] = useState<number | null>(null);
    const [activePhoneme, setActivePhoneme] = useState("");
    const [stats, setStats] = useState({ totalPopped: 0, lastPopped: "", streak: 0 });
    const [draggingBalloonId, setDraggingBalloonId] = useState<number | null>(null);
    const [lastClickTime, setLastClickTime] = useState<number>(0);
    const [lastClickBalloonId, setLastClickBalloonId] = useState<number | null>(null);
    const [activities, setActivities] = useState<ActivityWithFiles[]>([]);
    const [isPending, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(false);
    const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
    const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
    const [downloadError, setDownloadError] = useState<string | null>(null);
    const router = useRouter();

    const audioRef = useRef<HTMLAudioElement | null>(null); // Added missing audioRef

    const { canvasRef, balloonsRef, fragmentsRef, popBalloon } = useBalloonAnimation(
        balloonCount,
        onBalloonPopped,
        setDialogOpen,
        setActiveColor,
        setActivePhoneme,
        setPoppedBalloonId,
        setStats
    );

    const handleFileDownload = useCallback(async (fileId: string, fileName: string) => {
        try {
            setDownloadingFileId(fileId);
            setDownloadError(null);

            const result = await getFileDownloadUrl({ fileId });

            if (result.success) {
                const link = document.createElement('a');
                link.href = result.url;
                link.setAttribute('download', fileName || `activity-${fileId}.pdf`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                setDownloadSuccess(fileId);
                setTimeout(() => setDownloadSuccess(null), 2000);
            } else {
                setDownloadError(fileId);
                setTimeout(() => setDownloadError(null), 3000);
            }
        } catch (error) {
            console.error("Download failed:", error);
            setDownloadError(fileId);
            setTimeout(() => setDownloadError(null), 3000);
        } finally {
            setDownloadingFileId(null);
        }
    }, []);

    const getColorName = (hexColor: string): string => colorNames[hexColor] || "Colorful";

    const handleCloseDialog = () => setDialogOpen(false);

    // Event handlers
    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Find the topmost balloon under the cursor
        const topmostBalloon = balloonsRef.current.reduce((top, current) => {
            if (current.popped) return top;
            const dx = current.x - clickX;
            const dy = current.y - Math.sin(current.floatPhase) * current.floatAmount - clickY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const hitRadius = 50 * current.size;

            if (distance < hitRadius && (!top || current.zIndex > top.zIndex)) {
                return current;
            }
            return top;
        }, null as Balloon | null);

        if (topmostBalloon) {
            const currentTime = Date.now();
            const timeSinceLastClick = currentTime - lastClickTime;

            if (timeSinceLastClick < 300 && lastClickBalloonId === topmostBalloon.id) {
                popBalloon(topmostBalloon.id);
                setLastClickTime(0);
                setLastClickBalloonId(null);
                setDraggingBalloonId(null);
            } else {
                setDraggingBalloonId(topmostBalloon.id);
                balloonsRef.current = balloonsRef.current.map(balloon => ({
                    ...balloon,
                    isDragging: balloon.id === topmostBalloon.id,
                    pressing: balloon.id === topmostBalloon.id,
                    zIndex: balloon.id === topmostBalloon.id ? 1000 : balloon.zIndex,
                }));
                setLastClickTime(currentTime);
                setLastClickBalloonId(topmostBalloon.id);
            }
        }
    }, [lastClickTime, lastClickBalloonId, popBalloon, balloonsRef]);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (draggingBalloonId !== null) {
            balloonsRef.current = balloonsRef.current.map(balloon => {
                if (balloon.id === draggingBalloonId && !balloon.popped) {
                    return {
                        ...balloon,
                        x: mouseX,
                        y: mouseY,
                        zIndex: 1000, // Ensure dragged balloon stays on top
                    };
                }
                return balloon;
            });
        } else {
            const hoveringBalloonIds = new Set<number>();
            balloonsRef.current.forEach(balloon => {
                if (balloon.popped) return;
                const dx = balloon.x - mouseX;
                const dy = balloon.y - Math.sin(balloon.floatPhase) * balloon.floatAmount - mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const hitRadius = 50 * balloon.size;
                if (distance < hitRadius) {
                    hoveringBalloonIds.add(balloon.id);
                }
            });

            balloonsRef.current = balloonsRef.current.map(balloon => {
                const isHovering = hoveringBalloonIds.has(balloon.id);
                return {
                    ...balloon,
                    hovering: isHovering,
                    zIndex: isHovering ? 100 : balloon.zIndex,
                };
            });
        }
    }, [draggingBalloonId, balloonsRef]);

    const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        balloonsRef.current = balloonsRef.current.map(balloon => ({
            ...balloon,
            isDragging: false,
            pressing: false,
        }));
        setDraggingBalloonId(null);
    }, []);

    // Ensure canvas is initialized
    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
        }
    }, [canvasRef]);

    return (
        <div className="flex items-center justify-center h-96 w-full bg-gradient-to-b from-blue-300 to-teal-300 overflow-hidden">
            <audio ref={audioRef} preload="auto" className="hidden">
                <source src="/path/to/pop-sound.mp3" type="audio/mpeg" />
            </audio>
            <div className="relative w-full h-full">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full cursor-pointer"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                />
            </div>
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent className="max-w-md max-h-[80vh] overflow-auto">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <div className="bg-purple-100 text-purple-600 p-1 rounded-full">
                                <Volume2 className="h-4 w-4" />
                            </div>
                            Phoneme "{activePhoneme}"
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-600">
                            {PHONEME_MESSAGES[activePhoneme] || `Phoneme "${activePhoneme}" sound.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {/* Phoneme info section */}
                    <div className="flex flex-col items-center gap-2 py-3 border-b border-slate-100 mb-3">
                        <div className="w-16 h-16 rounded-full mb-1 shadow-inner" style={{ backgroundColor: activeColor }}></div>
                        <div className="text-sm text-slate-500">
                            <span className="font-medium" style={{ color: activeColor }}>{getColorName(activeColor)}</span> balloon
                        </div>
                        {stats.streak > 1 && (
                            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mt-1">
                                Streak: {stats.streak} 🔥
                            </div>
                        )}
                    </div>

                    {/* Activities section */}
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
                                            {activity.files?.[0] && (
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
                                                                onClick={() => handleFileDownload(activity.files[0].id, activity.files[0].name)}
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
                        <AlertDialogAction onClick={handleCloseDialog} className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-all flex items-center w-full sm:w-auto justify-center gap-1 mt-0">
                            Close
                        </AlertDialogAction>
                        {activities.length > 0 && (
                            <Button variant="default" className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-yellow-400 text-white font-medium hover:shadow-lg hover:shadow-pink-500/20 transition-all flex items-center w-full sm:w-auto justify-center gap-1" onClick={() => router.push('/dashboard/games')}>
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

export default BalloonField;
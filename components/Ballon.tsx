import React, {useCallback, useEffect, useRef, useState, useTransition} from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {getFileDownloadUrl} from "@/lib/actions/file-download.action";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {CheckCircle2, ExternalLink, FileDown, Volume2, XCircle, X, BookOpen} from "lucide-react";
import {cn} from "@/lib/utils";
import {Balloon, BalloonFieldProps, Fragment} from "@/components/ballons/types";
import {balloonColors, colorNames, PHONEME_MESSAGES, phonemes} from "@/components/ballons/constants";
import {getActivitiesByPhoneme} from "@/lib/actions/activity.action";
import {ActivityWithFiles} from "@/types/activity";
import {getBadgeVariant} from './ballons/utils';
import PhonemeDialog from "@/components/dialogs/phonemeDialog";
import { getColorName } from '@/utils/phonemeList';


const BalloonField: React.FC<BalloonFieldProps> = ({
                                                       balloonCount = 23, // Fixed at 23 balloons
                                                       title = "Phoneme Pop!",
                                                       description = "Pop balloons to learn phonemes",
                                                       onBalloonPopped
                                                   }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const balloonsRef = useRef<Balloon[]>([]);
    const fragmentsRef = useRef<Fragment[]>([]);
    const animationRef = useRef<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [activeColor, setActiveColor] = useState<string>("");
    const [poppedBalloonId, setPoppedBalloonId] = useState<number | null>(null);
    const [activePhoneme, setActivePhoneme] = useState<string>("");

    const [draggingBalloonId, setDraggingBalloonId] = useState<number | null>(null);
    const [lastClickTime, setLastClickTime] = useState<number>(0);
    const [lastClickBalloonId, setLastClickBalloonId] = useState<number | null>(null);
// /   / Add these near your other state declarations
    const [activities, setActivities] = useState<ActivityWithFiles[]>([]);
    const [isPending, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(false);
    const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
    const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
    const [downloadError, setDownloadError] = useState<string | null>(null);
    const router = useRouter(); // Add this import from 'next/navigation'
    // Initialize canvas and balloons

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas dimensions with proper pixel ratio for sharpness
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        // Initialize balloons
        initializeBalloons();

        // Start animation
        startAnimation();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [balloonCount]);

    useEffect(() => {
        const cleanupInterval = setInterval(() => {
            if (fragmentsRef.current.length > 100) {
                fragmentsRef.current = fragmentsRef.current.filter(f => f.opacity > 0.05);
            }
        }, 1000);

        return () => clearInterval(cleanupInterval);
    }, []);

    // Re-initialize balloons when dialog closes
    useEffect(() => {
        if (!dialogOpen && poppedBalloonId !== null) {
            // Re-inflate the popped balloon
            balloonsRef.current = balloonsRef.current.map(balloon => {
                if (balloon.id === poppedBalloonId) {
                    return {
                        ...balloon,
                        popped: false,
                        // Reset any animation state
                        floatPhase: Math.random() * Math.PI * 2,
                        // Put balloon at a slightly different position for visual interest
                        x: balloon.x + (Math.random() - 0.5) * 20,
                    };
                }
                return balloon;
            });

            // Clear the popped balloon reference
            setPoppedBalloonId(null);
        }
    }, [dialogOpen]);

    useEffect(() => {
        const fetchActivities = async () => {
            setIsLoading(true);
            try {
                // Assume there's an API call to fetch activities based on the activePhoneme
            } catch (error) {
                console.error("Failed to fetch activities:", error);
            } finally {
                setIsLoading(false);
            }
        };

        console.log(activePhoneme)

        if (activePhoneme) {
            fetchActivities();
        }
    }, [activePhoneme]);


    // Check if two balloons overlap by more than 60%
    const checkOverlap = (balloon1: Balloon, balloon2: Balloon): boolean => {
        const dx = balloon1.x - balloon2.x;
        const dy = balloon1.y - balloon2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate sizes
        const size1 = 50 * balloon1.size;
        const size2 = 50 * balloon2.size;

        // Allow 60% overlap
        const maxOverlap = (size1 + size2) * 0.3; // Reduced to allow more overlap (30% separation)

        return distance < maxOverlap;
    };

    // Initialize balloons with better positioning
    const initializeBalloons = (): void => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Precompute shared values
        const leftAnchorX = width * 0.25;
        const rightAnchorX = width * 0.75;
        const anchorY = height;
        const virtualHeight = height * 0.8;
        const leftBalloonCount = 10;
        const rightBalloonCount = 10;
        const totalBalloons = leftBalloonCount + rightBalloonCount;

        // Use fewer phonemes if we have more than available
        const safePhonemes = phonemes.length >= totalBalloons
            ? phonemes
            : [...phonemes, ...phonemes].slice(0, totalBalloons);

        const balloons: Balloon[] = [];

        // Create balloons in a single function to avoid code duplication
        const createBalloonGroup = (
            count: number,
            startId: number,
            anchorX: number,
            isLeft: boolean
        ) => {
            const widthRange: [number, number] = isLeft
                ? [anchorX - width * 0.2, anchorX + width * 0.15]
                : [anchorX - width * 0.15, anchorX + width * 0.2];

            // Create all balloons at once but with different heights
            const heightSections = 4;
            const sectionHeight = virtualHeight / heightSections;

            for (let i = 0; i < count; i++) {
                const id = startId + i;
                const colorIndex = id % balloonColors.length;

                // Distribute balloons evenly in height sections
                const sectionIndex = Math.floor((i / count) * heightSections);
                const heightRange: [number, number] = [
                    30 + sectionIndex * sectionHeight,
                    Math.min(height * 0.7, 30 + (sectionIndex + 1) * sectionHeight - 50)
                ];

                // Use memoized random values for better performance
                const size = 0.8 + Math.random() * 0.4;
                const phoneme = safePhonemes[id % safePhonemes.length];

                // Find a valid position with fewer attempts for better performance
                const position = findValidPosition(balloons, widthRange, heightRange, 30); // Limit to 30 attempts

                // Create the balloon with optimized parameters
                balloons.push({
                    id,
                    x: position.x,
                    y: position.y,
                    color: balloonColors[colorIndex],
                    size,
                    popped: false,
                    floatPhase: Math.random() * Math.PI * 2,
                    floatSpeed: 0.3 + Math.random() * 0.3, // Slightly reduced for performance
                    floatAmount: 2 + Math.random() * 3,    // Slightly reduced for performance
                    rotation: (Math.random() - 0.5) * 0.2,
                    stringLength: Math.sqrt(
                        Math.pow(position.x - anchorX, 2) +
                        Math.pow(position.y - anchorY, 2)
                    ),
                    hovering: false,
                    pressing: false,
                    anchorGroup: isLeft ? 'left' : 'right',
                    phoneme,
                    zIndex: 0,
                    isDragging: false
                });
            }
        };

        // Create both balloon groups
        createBalloonGroup(leftBalloonCount, 0, leftAnchorX, true);
        createBalloonGroup(rightBalloonCount, leftBalloonCount, rightAnchorX, false);

        balloonsRef.current = balloons;
    };

    // Add this function before the popBalloon function
    const handleFileDownload = useCallback(async (fileId: string, fileName: string) => {

        try {
            setDownloadingFileId(fileId);
            setDownloadError(null);

            const result = await getFileDownloadUrl({fileId});

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
    }, []);


    const findValidPosition = (
        balloons: Balloon[],
        widthRange: [number, number],
        heightRange: [number, number],
        maxAttempts: number = 50
    ): { x: number, y: number } => {
        // Initialize with default values - this ensures they're always defined
        let x: number = widthRange[0] + Math.random() * (widthRange[1] - widthRange[0]);
        let y: number = heightRange[0] + Math.random() * (heightRange[1] - heightRange[0]);
        let isValid = false;
        let attempts = 0;

        // Try to find a non-overlapping position
        while (!isValid && attempts < maxAttempts) {
            // Generate new random position
            x = widthRange[0] + Math.random() * (widthRange[1] - widthRange[0]);
            y = heightRange[0] + Math.random() * (heightRange[1] - heightRange[0]);

            // Check against existing balloons
            isValid = true;

            // Only check against balloons that could potentially overlap
            for (const balloon of balloons) {
                const dx = balloon.x - x;
                const dy = balloon.y - y;

                // Skip balloons that are far away
                if (dx * dx + dy * dy > 10000) continue;

                // Create a temporary balloon to check overlap
                const tempBalloon: Balloon = {
                    id: -1,
                    x,
                    y,
                    color: "",
                    size: 0.7 + Math.random() * 0.5,
                    popped: false,
                    floatPhase: 0,
                    floatSpeed: 0,
                    floatAmount: 0,
                    rotation: 0,
                    stringLength: 0,
                    hovering: false,
                    pressing: false,
                    anchorGroup: 'left',
                    phoneme: '',
                    zIndex: 0,
                    isDragging: false
                };

                if (checkOverlap(tempBalloon, balloon)) {
                    isValid = false;
                    break;
                }
            }

            attempts++;
        }

        // If we couldn't find a valid position after attempts,
        // just use the last position we tried
        return {x, y};
    };


    const startAnimation = (): void => {
        let lastTime = 0;
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }


        const animate = (timestamp: number): void => {
            const delta = lastTime ? (timestamp - lastTime) / 16.66 : 12; // normalize to ~60fps
            lastTime = timestamp;

            // Skip frames when browser tab is inactive or frame rate is very low
            if (delta > 100) {
                animationRef.current = requestAnimationFrame(animate);
                return;
            }

            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d', {alpha: false});
            if (!ctx) return;

            const rect = canvas.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;

            // Clear canvas
            ctx.clearRect(0, 0, width, height);

            // Cache anchor points to avoid recalculation
            const leftAnchorX = width * 0.25;
            const rightAnchorX = width * 0.75;
            const anchorY = height;

            // Check if we have active fragments or dragging balloons
            const hasActiveFragments = fragmentsRef.current.length > 0;
            const hasDraggingBalloons = draggingBalloonId !== null;

            // Only sort balloons if necessary (when dragging or hovering)
            const sortedBalloons = hasDraggingBalloons ?
                [...balloonsRef.current].sort((a, b) => a.zIndex - b.zIndex) :
                balloonsRef.current;

            // Limit how many balloons update their float animation each frame
            // This staggers the animation calculations to improve performance
            const updateCount = Math.min(sortedBalloons.length, 8); // Only update 8 balloons per frame
            const updateOffset = Math.floor(timestamp / 100) % sortedBalloons.length; // Cycle through all balloons

            // Update and draw visible balloons
            sortedBalloons.forEach((balloon, index) => {
                if (balloon.popped) return;

                // Only update float animation for some balloons each frame
                // Always update the dragging balloon
                if (balloon.id === draggingBalloonId || (index + updateOffset) % sortedBalloons.length < updateCount) {
                    balloon.floatPhase += 0.02 * balloon.floatSpeed * delta;
                }

                const floatY = Math.sin(balloon.floatPhase) * balloon.floatAmount;

                // Skip drawing balloons that are far off-screen
                if (balloon.x < -100 || balloon.x > width + 100 ||
                    balloon.y + floatY < -150 || balloon.y + floatY > height + 50) {
                    return;
                }

                // Get appropriate anchor based on balloon's group
                const anchorX = balloon.anchorGroup === 'left' ? leftAnchorX : rightAnchorX;

                // Draw balloon
                drawBalloon(ctx, balloon, floatY, anchorX, anchorY);
            });

            // Process fragments in batches for better performance
            const maxFragmentsPerFrame = 150; // Process at most 150 fragments per frame
            let processedFragments = 0;
            let anyActiveFragments = false;

            for (let i = 0; i < fragmentsRef.current.length && processedFragments < maxFragmentsPerFrame; i++) {
                const fragment = fragmentsRef.current[i];

                // Update physics
                fragment.velocity.x *= 0.98; // air resistance
                fragment.velocity.y *= 0.98;
                fragment.velocity.y += 0.2 * delta; // gravity

                fragment.x += fragment.velocity.x * delta;
                fragment.y += fragment.velocity.y * delta;
                fragment.rotation += fragment.rotationSpeed * delta;

                // Skip fragments that are off-screen or nearly transparent
                if (fragment.y > height + 50 || fragment.opacity <= 0.01) {
                    continue;
                }

                anyActiveFragments = true;
                processedFragments++;

                // Decrease opacity over time
                fragment.opacity = Math.max(0, fragment.opacity - 0.005 * delta);

                // Draw fragment
                ctx.save();
                ctx.translate(fragment.originX + fragment.x, fragment.originY + fragment.y);
                ctx.rotate(fragment.rotation);
                ctx.globalAlpha = fragment.opacity;

                if (fragment.type === 'rubber') {
                    // Draw rubber piece - simplified path for performance
                    ctx.beginPath();
                    ctx.moveTo(-fragment.size / 2, -fragment.size / 4);
                    ctx.quadraticCurveTo(0, -fragment.size / 2, fragment.size / 2, -fragment.size / 4);
                    ctx.quadraticCurveTo(fragment.size / 3, fragment.size / 4, 0, fragment.size / 2);
                    ctx.quadraticCurveTo(-fragment.size / 3, fragment.size / 4, -fragment.size / 2, -fragment.size / 4);
                    ctx.fillStyle = fragment.color;
                    ctx.fill();
                } else {
                    // Draw dust particle - use rectangle for very small particles for performance
                    if (fragment.size < 3) {
                        ctx.fillStyle = fragment.color;
                        ctx.fillRect(-fragment.size / 2, -fragment.size / 2, fragment.size, fragment.size);
                    } else {
                        ctx.beginPath();
                        ctx.arc(0, 0, fragment.size / 2, 0, Math.PI * 2);
                        ctx.fillStyle = fragment.color;
                        ctx.fill();
                    }
                }

                ctx.restore();
            }

            // Clean up old fragments periodically, not every frame
            if (timestamp % 60 < 16.66 && fragmentsRef.current.length > 500) {
                fragmentsRef.current = fragmentsRef.current.filter(f => f.opacity > 0.02);
            }

            animationRef.current = requestAnimationFrame(animate);
        };
        animationRef.current = requestAnimationFrame(animate);
    };

    // Utility to shade color
    const shadeColor = (color: string, percent: number): string => {
        let R = parseInt(color.substring(1, 3), 16);
        let G = parseInt(color.substring(3, 5), 16);
        let B = parseInt(color.substring(5, 7), 16);

        R = Math.min(255, Math.max(0, Math.round(R * (1 + percent / 100))));
        G = Math.min(255, Math.max(0, Math.round(G * (1 + percent / 100))));
        B = Math.min(255, Math.max(0, Math.round(B * (1 + percent / 100))));

        return `#${R.toString(16).padStart(2, '0')}${G.toString(16).padStart(2, '0')}${B.toString(16).padStart(2, '0')}`;
    };

    const drawBalloon = (
        ctx: CanvasRenderingContext2D,
        balloon: Balloon,
        floatY: number,
        anchorX: number,
        anchorY: number
    ): void => {
        const {x, y, color, size, rotation, hovering, pressing} = balloon;

        // Updated balloon dimensions - slightly more rounded shape
        const balloonWidth = 100 * size;  // Wider
        const balloonHeight = 120 * size; // Taller

        let scaleX = 1;
        let scaleY = 1;
        if (balloon.x < -100 || balloon.x > ctx.canvas.width + 100 ||
            balloon.y < -100 || balloon.y > ctx.canvas.height + 100) {
            return;
        }
        if (hovering) {
            scaleX = 1.08;
            scaleY = 1.08;
        }

        if (pressing) {
            scaleX = 1.1;
            scaleY = 0.98;
        }

        const balloonY = y + floatY;

        ctx.save();
        ctx.translate(x, balloonY);
        ctx.rotate(rotation);
        ctx.scale(scaleX, scaleY);

        // More rounded balloon shape
        ctx.beginPath();
        ctx.ellipse(0, 0, balloonWidth / 2, balloonHeight / 2, 0, 0, Math.PI * 2);

        // Softer gradient
        const gradient = ctx.createRadialGradient(
            -balloonWidth / 4, -balloonHeight / 4, 0,
            0, 0, balloonWidth * 0.8
        );
        gradient.addColorStop(0, shadeColor(color, 20));
        gradient.addColorStop(0.6, color);
        gradient.addColorStop(1, shadeColor(color, -10));

        ctx.fillStyle = gradient;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 4;
        ctx.fill();

        // Thinner outline
        ctx.strokeStyle = shadeColor(color, -30);
        ctx.lineWidth = 2 * (size / 0.8);
        ctx.stroke();

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Subtler highlights
        ctx.beginPath();
        ctx.ellipse(
            -balloonWidth / 5, -balloonHeight / 4,
            balloonWidth / 10, balloonHeight / 8,
            Math.PI / 4,
            0, Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(
            -balloonWidth / 10, -balloonHeight / 10,
            balloonWidth / 25, balloonHeight / 25,
            0,
            0, Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();

        // Smaller tie
        const tieSize = 10 * size;
        ctx.beginPath();
        ctx.moveTo(-tieSize / 2, balloonHeight / 2);
        ctx.lineTo(0, balloonHeight / 2 + tieSize);
        ctx.lineTo(tieSize / 2, balloonHeight / 2);
        ctx.closePath();
        ctx.fillStyle = shadeColor(color, -20);
        ctx.fill();
        ctx.strokeStyle = shadeColor(color, -40);
        ctx.lineWidth = 1.5 * (size / 0.8);
        ctx.stroke();

        // Text styling (unchanged)
        ctx.save();
        ctx.scale(1 / scaleX, 1 / scaleY);
        ctx.rotate(-rotation);
        const fontSize = Math.max(36 * size, 24);
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = shadeColor(color, -50);
        ctx.lineWidth = fontSize / 10;
        ctx.strokeText(balloon.phoneme, 0, 0);
        ctx.fillText(balloon.phoneme, 0, 0);
        ctx.restore();

        ctx.restore();

        // Updated string - dashed and thinner
        ctx.save();
        const balloonBottom = balloonY + (balloonHeight / 2 + tieSize) * scaleY;
        ctx.beginPath();
        ctx.moveTo(anchorX, anchorY);
        const stringMidX = (x + anchorX) / 2;
        const stringMidY = (balloonBottom + anchorY) / 2 + Math.sin(balloon.floatPhase / 2) * 8;
        ctx.quadraticCurveTo(
            stringMidX, stringMidY + 15,
            x, balloonBottom
        );
        ctx.strokeStyle = shadeColor(color, -40);
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 3]); // Dashed line
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash
        ctx.restore();
    };

    // Handle apple click with server action call
    const handleAppleClick = useCallback((phoneme: string) => {

        setIsLoading(true);

        startTransition(async () => {
            try {
                // Call the server action to get activities for this phoneme
                const result = await getActivitiesByPhoneme({
                    phoneme,
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
    }, []);


    // Generate fragments for a popped balloon
    const popBalloon = (balloonId: number): void => {
        const balloon = balloonsRef.current.find(b => b.id === balloonId);
        const fragmentCount = window.navigator.hardwareConcurrency > 4 ? 20 : 10;

        if (!balloon || balloon.popped) return;

        // Mark as popped
        balloon.popped = true;

        // Set popped balloon ID for restoration later
        setPoppedBalloonId(balloonId);

        // Store color and phoneme for dialog
        setActiveColor(balloon.color);


        setActivePhoneme(balloon.phoneme);
        handleAppleClick(balloon.phoneme);
        // // Update stats
        // setStats(prev => {
        //     const newStreak = prev.lastPopped === balloon.phoneme ? prev.streak + 1 : 1;
        //     return {
        //         totalPopped: prev.totalPopped + 1,
        //         lastPopped: balloon.phoneme,
        //         streak: newStreak
        //     };
        // });

        // Call the callback if provided
        if (onBalloonPopped) {
            onBalloonPopped(balloon.phoneme, balloon.color);
        }

        // Play pop sound
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {
            });
        }

        const fragments: Fragment[] = [];
        const {x, y, color, size} = balloon;

        // Large rubber pieces
        for (let i = 0; i < Math.min(6, fragmentCount / 4); i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 8;
            fragments.push({
                type: 'rubber',
                size: 15 * size + Math.random() * 15 * size,
                x: 0,
                y: 0,
                originX: x,
                originY: y,
                velocity: {
                    x: Math.cos(angle) * speed * (0.5 + Math.random()),
                    y: Math.sin(angle) * speed * (0.5 + Math.random())
                },
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                opacity: 1,
                color: shadeColor(color, Math.random() * 40 - 20)
            });
        }


        // Medium rubber pieces
        for (let i = 0; i < Math.min(8, fragmentCount / 3); i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 4 + Math.random() * 10;
            fragments.push({
                type: 'rubber',
                size: 6 * size + Math.random() * 10 * size,
                x: 0,
                y: 0,
                originX: x,
                originY: y,
                velocity: {
                    x: Math.cos(angle) * speed * (0.5 + Math.random()),
                    y: Math.sin(angle) * speed * (0.5 + Math.random())
                },
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.3,
                opacity: 1,
                color: shadeColor(color, Math.random() * 50 - 25)
            });
        }

        // Small dust particles
        for (let i = 0; i < Math.min(15, fragmentCount / 2); i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 5 + Math.random() * 12;
            fragments.push({
                type: 'dust',
                size: 1 * size + Math.random() * 3 * size,
                x: 0,
                y: 0,
                originX: x,
                originY: y,
                velocity: {
                    x: Math.cos(angle) * speed * (0.5 + Math.random()),
                    y: Math.sin(angle) * speed * (0.5 + Math.random())
                },
                rotation: 0,
                rotationSpeed: 0,
                opacity: 1,
                color: shadeColor(color, Math.random() * 60 - 30)
            });
        }

        // Add fragments to the global collection
        fragmentsRef.current = [...fragmentsRef.current, ...fragments];

        // Open dialog after a short delay for pop effect to be visible
        setTimeout(() => {
            setDialogOpen(true);
        }, 500);
    };

    // Find the topmost balloon in a stack of overlapping balloons
    const findTopmostBalloon = (x: number, y: number): Balloon | null => {
        const hoveringBalloons = balloonsRef.current.filter(balloon => {
            if (balloon.popped) return false;

            const dx = balloon.x - x;
            const dy = (balloon.y + Math.sin(balloon.floatPhase) * balloon.floatAmount) - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const hitRadius = 50 * balloon.size;

            return distance < hitRadius;
        });

        if (hoveringBalloons.length === 0) return null;

        // Sort by zIndex (highest first) and then by ID to ensure consistent top balloon
        return hoveringBalloons.reduce((top, current) =>
            current.zIndex > top.zIndex ||
            (current.zIndex === top.zIndex && current.id > top.id) ? current : top
        );
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>): void => {
        e.preventDefault(); // Prevent default browser behavior
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const topmostBalloon = findTopmostBalloon(clickX, clickY);

        if (topmostBalloon) {
            const currentTime = Date.now();
            const timeSinceLastClick = currentTime - lastClickTime;

            if (timeSinceLastClick < 300 && lastClickBalloonId === topmostBalloon.id) {
                // Double click detected
                popBalloon(topmostBalloon.id);
                setLastClickTime(0);
                setLastClickBalloonId(null);
                setDraggingBalloonId(null);
            } else {
                // Start dragging
                setDraggingBalloonId(topmostBalloon.id);
                balloonsRef.current = balloonsRef.current.map(balloon => ({
                    ...balloon,
                    isDragging: balloon.id === topmostBalloon.id,
                    pressing: balloon.id === topmostBalloon.id,
                    zIndex: balloon.id === topmostBalloon.id ? 1000 : balloon.zIndex
                }));
                setLastClickTime(currentTime);
                setLastClickBalloonId(topmostBalloon.id);
            }
        }
    };

    const throttledMouseMove = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>): void => {
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
                            zIndex: 1000 // Ensure dragged balloon stays on top
                        };
                    }
                    return balloon;
                });
            } else {
                const hoveringBalloonIds = new Set<number>();
                balloonsRef.current.forEach(balloon => {
                    if (balloon.popped) return;
                    const dx = balloon.x - mouseX;
                    const dy = (balloon.y + Math.sin(balloon.floatPhase) * balloon.floatAmount) - mouseY;
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
                        zIndex: isHovering && balloon.id !== draggingBalloonId ? 100 : balloon.zIndex
                    };
                });
            }
        },
        [draggingBalloonId]
    );


    const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>): void => {
        balloonsRef.current = balloonsRef.current.map(balloon => ({
            ...balloon,
            isDragging: false,
            pressing: false
        }));
        setDraggingBalloonId(null);
    };
    // Close dialog handler
    const handleCloseDialog = (): void => {
        setDialogOpen(false);
    };



    // @ts-ignore
    return (
        <div
            className="flex items-center justify-center h-96 w-full bg-gradient-to-b from-blue-300 to-teal-300 overflow-hidden">
            {/* Audio element for pop sound */}
            <audio ref={audioRef} preload="auto" className="hidden">
                {/* Pop sound would go here */}
            </audio>

            <div className="relative w-full h-full">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full cursor-pointer"
                    // onClick={handleCanvasClick}
                    onMouseMove={throttledMouseMove}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                />
            </div>


            <PhonemeDialog setDialogOpen={setDialogOpen} dialogOpen={dialogOpen} activeColor={activeColor}
                           activePhoneme={activePhoneme} activities={activities} isLoading={isLoading}
                           isPending={isPending} downloadingFileId={downloadingFileId} downloadSuccess={downloadSuccess}
                           downloadError={downloadError} handleFileDownload={handleFileDownload}
                           handleCloseDialog={handleCloseDialog} getColorName={getColorName}/>
        </div>
    );
};

export default BalloonField;
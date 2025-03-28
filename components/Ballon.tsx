import React, { useState, useEffect, useRef } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// TypeScript interfaces
interface Balloon {
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    popped: boolean;
    floatPhase: number;
    floatSpeed: number;
    floatAmount: number;
    rotation: number;
    stringLength: number;
    hovering: boolean;
    pressing: boolean;
    anchorGroup: 'left' | 'right'; // Which anchor point this balloon is tied to
    phoneme: string; // The phoneme/letter displayed on the balloon
    zIndex: number; // Used to determine stacking order for hovering balloons
    isDragging: boolean;  // New property to track dragging state

}

interface Fragment {
    type: 'rubber' | 'dust';
    size: number;
    x: number;
    y: number;
    originX: number;
    originY: number;
    velocity: {
        x: number;
        y: number;
    };
    rotation: number;
    rotationSpeed: number;
    opacity: number;
    color: string;
}

interface ColorMapping {
    [key: string]: string;
}

interface BalloonFieldProps {
    balloonCount?: number;
    title?: string;
    description?: string;
    onBalloonPopped?: (phoneme: string, color: string) => void;
}

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
    const [stats, setStats] = useState<{
        totalPopped: number;
        lastPopped: string;
        streak: number;
    }>({
        totalPopped: 0,
        lastPopped: "",
        streak: 0
    });
    const [draggingBalloonId, setDraggingBalloonId] = useState<number | null>(null);
    const [lastClickTime, setLastClickTime] = useState<number>(0);
    const [lastClickBalloonId, setLastClickBalloonId] = useState<number | null>(null);


    // Phonemes to display on balloons
    const phonemes: string[] = [
        "P", "L", "K", "T", "S", "CH", "LH", "F", "B", "N", "G", "D", "Z",
        "J", "NH", "V", "M", "R", "ARQ", "C/R/V", "C/L/V", "Vogais"
    ];

    // Generate vibrant balloon colors
    const balloonColors: string[] = [
        "#ff3333", // Red
        "#ff9933", // Orange
        "#ffff33", // Yellow
        "#33ff33", // Green
        "#33ffff", // Cyan
        "#3333ff", // Blue
        "#9933ff", // Purple
        "#ff33ff", // Magenta
        "#ff3399", // Pink
        "#99ff33", // Lime
        "#33ff99", // Mint
        "#9999ff", // Lavender
        "#ff9999", // Light Pink
        "#ffcc33", // Gold
        "#33ccff", // Sky Blue
        "#cc33ff", // Violet
        "#ffcc99", // Peach
        "#99ffcc", // Seafoam
        "#cc99ff", // Light Purple
        "#33cc33", // Emerald
        "#ff3366", // Rose
        "#66ff33", // Bright Green
        "#33cccc"  // Teal
    ];


    // const balloonColors: string[] = [
    //     "#FF69B4", // Hot Pink
    //     "#FFB6C1", // Light Pink
    //     "#FFC0CB", // Pink
    //     "#FF82AB", // Pale Violet Red
    //     "#FF5C8D", // Raspberry Pink
    //     "#FF1493", // Deep Pink
    //     "#DB7093", // Pale Violet Red
    //     "#FF007F", // Rose
    //     "#FF85A2", // Flamingo Pink
    //     "#FF66B2", // Pastel Pink
    //     "#FFD1DC", // Baby Pink
    //     "#FF91A4", // Salmon Pink
    //     "#FFACC7", // Amaranth Pink
    //     "#FFA6C9", // Carnation Pink
    //     "#FF9EBB", // Charm Pink
    //     "#FAA0BD", // Baker-Miller Pink
    //     "#EB9DAF", // Mauvelous
    //     "#E68FAC", // Charm Pink
    //     "#DE6FA1", // Thulian Pink
    //     "#D65282", // Raspberry Rose
    //     "#FC89AC", // Tickle Me Pink
    //     "#F4B4C4", // Classic Rose
    //     "#FF8DA1"  // Flamingo
    // ];
    // const balloonColors: string[] = [
    //     "#FFB6C1", // Light Pink
    //     "#FFDAB9", // Peach
    //     "#E6E6FA", // Lavender
    //     "#B0E0E6", // Powder Blue
    //     "#98FB98", // Pale Green
    //     "#F0E68C", // Khaki
    //     "#DDA0DD", // Plum
    //     "#ADD8E6", // Light Blue
    //     "#F5DEB3", // Wheat
    //     "#E0FFFF", // Light Cyan
    //     "#FFFACD"  // Lemon Chiffon
    // ];
    // Color names mapping
    const colorNames: ColorMapping = {
        "#ff3333": "Red",
        "#ff9933": "Orange",
        "#ffff33": "Yellow",
        "#33ff33": "Green",
        "#33ffff": "Cyan",
        "#3333ff": "Blue",
        "#9933ff": "Purple",
        "#ff33ff": "Magenta",
        "#ff3399": "Pink",
        "#99ff33": "Lime",
        "#33ff99": "Mint",
        "#9999ff": "Lavender",
        "#ff9999": "Light Pink",
        "#ffcc33": "Gold",
        "#33ccff": "Sky Blue",
        "#cc33ff": "Violet",
        "#ffcc99": "Peach",
        "#99ffcc": "Seafoam",
        "#cc99ff": "Light Purple",
        "#33cc33": "Emerald",
        "#ff3366": "Rose",
        "#66ff33": "Bright Green",
        "#33cccc": "Teal"
    };
    // const colorNames: ColorMapping = {
    //     "#FFB6C1": "Light Pink",
    //     "#FFDAB9": "Peach",
    //     "#E6E6FA": "Lavender",
    //     "#B0E0E6": "Powder Blue",
    //     "#98FB98": "Pale Green",
    //     "#F0E68C": "Khaki",
    //     "#DDA0DD": "Plum",
    //     "#ADD8E6": "Light Blue",
    //     "#F5DEB3": "Wheat",
    //     "#E0FFFF": "Light Cyan",
    //     "#FFFACD": "Lemon Chiffon"
    // };
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

        // Load stats from localStorage if available
        const savedStats = localStorage.getItem('balloonStats');
        if (savedStats) {
            try {
                setStats(JSON.parse(savedStats));
            } catch (e) {
                console.error('Error loading balloon stats:', e);
            }
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [balloonCount]);

    // Save stats to localStorage when they change
    useEffect(() => {
        localStorage.setItem('balloonStats', JSON.stringify(stats));
    }, [stats]);

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

    // Find a valid position for a balloon
    const findValidPosition = (
        balloons: Balloon[],
        widthRange: [number, number],
        heightRange: [number, number]
    ): { x: number, y: number } => {
        let x: number, y: number;
        let isValid = false;
        let attempts = 0;

        while (!isValid && attempts < 50) {
            // Random position within the range
            x = widthRange[0] + Math.random() * (widthRange[1] - widthRange[0]);
            y = heightRange[0] + Math.random() * (heightRange[1] - heightRange[0]);

            // Check against existing balloons
            isValid = true;
            for (const balloon of balloons) {
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
                    anchorGroup: 'left', // Default, not used for overlap check
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

            // If valid position found, return it
            if (isValid) {
                return { x, y };
            }
        }

        // If we couldn't find a valid position after many attempts,
        // just return a random position and let them overlap
        return {
            x: widthRange[0] + Math.random() * (widthRange[1] - widthRange[0]),
            y: heightRange[0] + Math.random() * (heightRange[1] - heightRange[0])
        };
    };

    // Initialize balloons with better positioning
    const initializeBalloons = (): void => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const balloons: Balloon[] = [];
        const leftAnchorX = width * 0.25;
        const rightAnchorX = width * 0.75;
        const anchorY = height;
        const virtualHeight = height * 0.8;
        const leftBalloonCount = 11;
        const rightBalloonCount = 12;

        // Create left balloons
        for (let i = 0; i < leftBalloonCount; i++) {
            const colorIndex = i % balloonColors.length;
            const widthRange: [number, number] = [leftAnchorX - width * 0.2, leftAnchorX + width * 0.15];
            const heightSections = 4;
            const sectionHeight = virtualHeight / heightSections;
            const sectionIndex = Math.floor((i / leftBalloonCount) * heightSections);
            const heightRange: [number, number] = [
                30 + sectionIndex * sectionHeight,
                Math.min(height * 0.7, 30 + (sectionIndex + 1) * sectionHeight - 50)
            ];

            // Slightly larger size range for more variation
            const size = 0.8 + Math.random() * 0.4;
            const phoneme = phonemes[i % phonemes.length];
            const position = findValidPosition(balloons, widthRange, heightRange);
            const dx = position.x - leftAnchorX;
            const dy = position.y - anchorY;
            const stringLength = Math.sqrt(dx * dx + dy * dy);
            const floatPhase = Math.random() * Math.PI * 2;
            const floatSpeed = 0.4 + Math.random() * 0.4; // Slower float for gentler motion
            const floatAmount = 3 + Math.random() * 4;
            const rotation = (Math.random() - 0.5) * 0.2; // Reduced rotation for subtler effect

            balloons.push({
                id: i,
                x: position.x,
                y: position.y,
                color: balloonColors[colorIndex],
                size,
                popped: false,
                floatPhase,
                floatSpeed,
                floatAmount,
                rotation,
                stringLength,
                hovering: false,
                pressing: false,
                anchorGroup: 'left',
                phoneme,
                zIndex: 0,
                isDragging: false
            });
        }

        // Create right balloons
        for (let i = 0; i < rightBalloonCount; i++) {
            const colorIndex = (i + leftBalloonCount) % balloonColors.length;
            const widthRange: [number, number] = [rightAnchorX - width * 0.15, rightAnchorX + width * 0.2];
            const heightSections = 4;
            const sectionHeight = virtualHeight / heightSections;
            const sectionIndex = Math.floor((i / rightBalloonCount) * heightSections);
            const heightRange: [number, number] = [
                30 + sectionIndex * sectionHeight,
                Math.min(height * 0.7, 30 + (sectionIndex + 1) * sectionHeight - 50)
            ];

            const size = 0.8 + Math.random() * 0.4;
            const phoneme = phonemes[(i + leftBalloonCount) % phonemes.length];
            const position = findValidPosition(balloons, widthRange, heightRange);
            const dx = position.x - rightAnchorX;
            const dy = position.y - anchorY;
            const stringLength = Math.sqrt(dx * dx + dy * dy);
            const floatPhase = Math.random() * Math.PI * 2;
            const floatSpeed = 0.4 + Math.random() * 0.4;
            const floatAmount = 3 + Math.random() * 4;
            const rotation = (Math.random() - 0.5) * 0.2;

            balloons.push({
                id: i + leftBalloonCount,
                x: position.x,
                y: position.y,
                color: balloonColors[colorIndex],
                size,
                popped: false,
                floatPhase,
                floatSpeed,
                floatAmount,
                rotation,
                stringLength,
                hovering: false,
                pressing: false,
                anchorGroup: 'right',
                phoneme,
                zIndex: 0,
                isDragging: false
            });
        }

        balloonsRef.current = balloons;
    };
    // Animation loop
    const startAnimation = (): void => {
        let lastTime = 0;
        const animate = (timestamp: number): void => {
            const delta = lastTime ? (timestamp - lastTime) / 16.66 : 12; // normalize to ~60fps
            lastTime = timestamp;

            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const rect = canvas.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;

            // Clear canvas
            ctx.clearRect(0, 0, width, height);

            // Define anchor points
            const leftAnchorX = width * 0.25;
            const rightAnchorX = width * 0.75;
            const anchorY = height;

            // Sort balloons by zIndex for proper rendering order (highest zIndex on top)
            const sortedBalloons = [...balloonsRef.current].sort((a, b) => a.zIndex - b.zIndex);

            // Update balloons
            sortedBalloons.forEach(balloon => {
                if (!balloon.popped) {
                    // Update float animation
                    balloon.floatPhase += 0.02 * balloon.floatSpeed * delta;
                    const floatY = Math.sin(balloon.floatPhase) * balloon.floatAmount;

                    // Get appropriate anchor based on balloon's group
                    const anchorX = balloon.anchorGroup === 'left' ? leftAnchorX : rightAnchorX;

                    // Draw balloon
                    drawBalloon(ctx, balloon, floatY, anchorX, anchorY);
                }
            });

// Update fragments
            let anyActiveFragments = false;
            fragmentsRef.current.forEach(fragment => {
                // Update physics
                fragment.velocity.x *= 0.98; // air resistance
                fragment.velocity.y *= 0.98;
                fragment.velocity.y += 0.2 * delta; // gravity

                fragment.x += fragment.velocity.x * delta;
                fragment.y += fragment.velocity.y * delta;
                fragment.rotation += fragment.rotationSpeed * delta;

                // Only consider visible fragments
                if (fragment.y < height + 50 && fragment.opacity > 0.01) {
                    anyActiveFragments = true;

                    // Decrease opacity over time
                    fragment.opacity = Math.max(0, fragment.opacity - 0.005 * delta);

                    // Draw fragment
                    ctx.save();
                    ctx.translate(fragment.originX + fragment.x, fragment.originY + fragment.y);
                    ctx.rotate(fragment.rotation);
                    ctx.globalAlpha = fragment.opacity;

                    if (fragment.type === 'rubber') {
                        // Draw rubber piece
                        ctx.beginPath();
                        ctx.moveTo(-fragment.size/2, -fragment.size/4);
                        ctx.quadraticCurveTo(0, -fragment.size/2, fragment.size/2, -fragment.size/4);
                        ctx.quadraticCurveTo(fragment.size/3, fragment.size/4, 0, fragment.size/2);
                        ctx.quadraticCurveTo(-fragment.size/3, fragment.size/4, -fragment.size/2, -fragment.size/4);
                        ctx.fillStyle = fragment.color;
                        ctx.fill();
                    } else {
                        // Draw dust particle
                        ctx.beginPath();
                        ctx.arc(0, 0, fragment.size / 2, 0, Math.PI * 2);
                        ctx.fillStyle = fragment.color;
                        ctx.fill();
                    }

                    ctx.restore();
                }
            });

            // Clean up old fragments
            if (fragmentsRef.current.length > 1000) {
                fragmentsRef.current = fragmentsRef.current.filter(f => f.opacity > 0.01);
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

    // Draw the balloon with a string connected to the anchor point
    // const drawBalloon = (
    //     ctx: CanvasRenderingContext2D,
    //     balloon: Balloon,
    //     floatY: number,
    //     anchorX: number,
    //     anchorY: number
    // ): void => {
    //     const { x, y, color, size, rotation, hovering, pressing } = balloon;
    //
    //     // Balloon dimensions - more oval/egg shaped like the reference
    //     const balloonWidth = 90 * size;
    //     const balloonHeight = 110 * size;
    //
    //     // Calculate hover/press effects
    //     let scaleX = 1;
    //     let scaleY = 1;
    //
    //     if (hovering) {
    //         // Expand slightly on hover
    //         scaleX = 1.05;
    //         scaleY = 1.05;
    //     }
    //
    //     if (pressing) {
    //         // Compress when pressing
    //         scaleX = 1.08;
    //         scaleY = 0.95;
    //     }
    //
    //     const balloonY = y + floatY;
    //
    //     // Draw balloon body first
    //     ctx.save();
    //     ctx.translate(x, balloonY);
    //     ctx.rotate(rotation);
    //     ctx.scale(scaleX, scaleY);
    //
    //     // Simple oval balloon shape matching the reference image
    //     ctx.beginPath();
    //     // Draw the oval balloon shape
    //     ctx.ellipse(0, 0, balloonWidth/2, balloonHeight/2, 0, 0, Math.PI * 2);
    //
    //     // Fill balloon with gradient like the reference
    //     const gradient = ctx.createRadialGradient(
    //         -balloonWidth / 5, -balloonHeight / 6, 0,
    //         0, 0, balloonWidth
    //     );
    //
    //     // Yellow-orange gradient like the reference image
    //     if (color === "#ffcc33" || color === "#ffff33" || color === "#ff9933") {
    //         // For yellow/orange balloons, use the reference colors
    //         gradient.addColorStop(0, "#ffee33"); // Bright yellow center
    //         gradient.addColorStop(0.7, "#ffcc33"); // Yellow
    //         gradient.addColorStop(0.9, "#ff9933"); // Orange edge
    //         gradient.addColorStop(1, "#ff8833"); // Darker orange edge
    //     } else {
    //         // For other colors, maintain their basic shading
    //         gradient.addColorStop(0, shadeColor(color, 25));
    //         gradient.addColorStop(0.7, color);
    //         gradient.addColorStop(0.9, shadeColor(color, -15));
    //         gradient.addColorStop(1, shadeColor(color, -25));
    //     }
    //
    //     ctx.fillStyle = gradient;
    //
    //     // Shadow below the balloon
    //     ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    //     ctx.shadowBlur = 10;
    //     ctx.shadowOffsetX = 2;
    //     ctx.shadowOffsetY = 5;
    //     ctx.fill();
    //
    //     // Balloon outline - thicker black outline like the reference
    //     ctx.strokeStyle = '#222222';
    //     ctx.lineWidth = 3 * (size / 0.7); // Thicker outline scaled by balloon size
    //     ctx.stroke();
    //
    //     // Reset shadow for other elements
    //     ctx.shadowColor = 'transparent';
    //     ctx.shadowBlur = 0;
    //     ctx.shadowOffsetX = 0;
    //     ctx.shadowOffsetY = 0;
    //
    //     // Add highlights like in the reference
    //     // Main highlight
    //     ctx.beginPath();
    //     ctx.ellipse(
    //         -balloonWidth / 6, -balloonHeight / 5,
    //         balloonWidth / 8, balloonHeight / 6,
    //         Math.PI / 4,
    //         0, Math.PI * 2
    //     );
    //     ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    //     ctx.fill();
    //
    //     // Small secondary highlight
    //     ctx.beginPath();
    //     ctx.ellipse(
    //         -balloonWidth / 8, -balloonHeight / 8,
    //         balloonWidth / 20, balloonHeight / 20,
    //         0,
    //         0, Math.PI * 2
    //     );
    //     ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    //     ctx.fill();
    //
    //     // Draw the triangular tie at the bottom like in the reference
    //     ctx.beginPath();
    //     const tieSize = 12 * size;
    //     ctx.moveTo(-tieSize/2, balloonHeight/2);
    //     ctx.lineTo(0, balloonHeight/2 + tieSize);
    //     ctx.lineTo(tieSize/2, balloonHeight/2);
    //     ctx.closePath();
    //
    //     // Fill the tie with a darker shade of the balloon color
    //     ctx.fillStyle = color === "#ffcc33" ? "#ff8833" : shadeColor(color, -30);
    //     ctx.fill();
    //
    //     // Outline for the tie
    //     ctx.strokeStyle = '#222222';
    //     ctx.lineWidth = 2 * (size / 0.7);
    //     ctx.stroke();
    //
    //     // Draw phoneme text
    //     ctx.save();
    //     // Reset scale and rotation for text to avoid distortion
    //     ctx.scale(1/scaleX, 1/scaleY);
    //     ctx.rotate(-rotation);
    //
    //     // Text style
    //     const fontSize = Math.max(36 * size, 24); // Slightly larger for better readability
    //     ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    //
    //     // White text with black outline for maximum visibility
    //     ctx.fillStyle = 'white';
    //     ctx.textAlign = 'center';
    //     ctx.textBaseline = 'middle';
    //
    //     // Add text outline
    //     ctx.strokeStyle = '#222222';
    //     ctx.lineWidth = fontSize / 8;
    //     ctx.strokeText(balloon.phoneme, 0, 0);
    //
    //     // Fill text
    //     ctx.fillText(balloon.phoneme, 0, 0);
    //     ctx.restore();
    //
    //     ctx.restore();
    //
    //     // Now draw the string - simple curved line like in the reference
    //     ctx.save();
    //
    //     const balloonBottom = balloonY + (balloonHeight/2 + tieSize) * scaleY;
    //
    //     ctx.beginPath();
    //     ctx.moveTo(anchorX, anchorY);
    //
    //     // Simple curved string with slight randomization
    //     const stringMidX = (x + anchorX) / 2;
    //     const stringMidY = (balloonBottom + anchorY) / 2 + Math.sin(balloon.floatPhase/2) * 10;
    //
    //     // Draw a simple curved string like in the reference
    //     ctx.quadraticCurveTo(
    //         stringMidX, stringMidY + 20,
    //         x, balloonBottom
    //     );
    //
    //     ctx.strokeStyle = '#222222'; // Black string like the reference
    //     ctx.lineWidth = 1.5;
    //     ctx.stroke();
    //
    //     ctx.restore();
    // };

    const drawBalloon = (
        ctx: CanvasRenderingContext2D,
        balloon: Balloon,
        floatY: number,
        anchorX: number,
        anchorY: number
    ): void => {
        const { x, y, color, size, rotation, hovering, pressing } = balloon;

        // Updated balloon dimensions - slightly more rounded shape
        const balloonWidth = 100 * size;  // Wider
        const balloonHeight = 120 * size; // Taller

        let scaleX = 1;
        let scaleY = 1;

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
        ctx.moveTo(-tieSize/2, balloonHeight/2);
        ctx.lineTo(0, balloonHeight/2 + tieSize);
        ctx.lineTo(tieSize/2, balloonHeight/2);
        ctx.closePath();
        ctx.fillStyle = shadeColor(color, -20);
        ctx.fill();
        ctx.strokeStyle = shadeColor(color, -40);
        ctx.lineWidth = 1.5 * (size / 0.8);
        ctx.stroke();

        // Text styling (unchanged)
        ctx.save();
        ctx.scale(1/scaleX, 1/scaleY);
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
        const balloonBottom = balloonY + (balloonHeight/2 + tieSize) * scaleY;
        ctx.beginPath();
        ctx.moveTo(anchorX, anchorY);
        const stringMidX = (x + anchorX) / 2;
        const stringMidY = (balloonBottom + anchorY) / 2 + Math.sin(balloon.floatPhase/2) * 8;
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
    // Generate fragments for a popped balloon
    const popBalloon = (balloonId: number): void => {
        const balloon = balloonsRef.current.find(b => b.id === balloonId);
        if (!balloon || balloon.popped) return;

        // Mark as popped
        balloon.popped = true;

        // Set popped balloon ID for restoration later
        setPoppedBalloonId(balloonId);

        // Store color and phoneme for dialog
        setActiveColor(balloon.color);
        setActivePhoneme(balloon.phoneme);

        // Update stats
        setStats(prev => {
            const newStreak = prev.lastPopped === balloon.phoneme ? prev.streak + 1 : 1;
            return {
                totalPopped: prev.totalPopped + 1,
                lastPopped: balloon.phoneme,
                streak: newStreak
            };
        });

        // Call the callback if provided
        if (onBalloonPopped) {
            onBalloonPopped(balloon.phoneme, balloon.color);
        }

        // Play pop sound
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
        }

        const fragments: Fragment[] = [];
        const { x, y, color, size } = balloon;

        // Large rubber pieces
        // Large rubber pieces
        for (let i = 0; i < 8; i++) {
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
        for (let i = 0; i < 12; i++) {
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
        for (let i = 0; i < 20; i++) {
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

    const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>): void => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const topmostBalloon = findTopmostBalloon(clickX, clickY);
        if (topmostBalloon) {
            popBalloon(topmostBalloon.id);
        }
    };

    // Handle click on canvas
    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>): void => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();

        // Get click position relative to canvas
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Find the topmost balloon under the cursor
        const topmostBalloon = findTopmostBalloon(clickX, clickY);

        // If there's a balloon, pop it
        if (topmostBalloon) {
            popBalloon(topmostBalloon.id);
        }
    };

    // Handle mouse movement for hover effects
    // const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>): void => {
    //     const canvas = canvasRef.current;
    //     if (!canvas) return;
    //
    //     const rect = canvas.getBoundingClientRect();
    //
    //     // Get mouse position relative to canvas
    //     const mouseX = e.clientX - rect.left;
    //     const mouseY = e.clientY - rect.top;
    //
    //     // Track which balloons are being hovered
    //     const hoveringBalloonIds = new Set<number>();
    //
    //     // First pass: determine which balloons are being hovered
    //     balloonsRef.current.forEach(balloon => {
    //         if (balloon.popped) return;
    //
    //         // Simple distance check
    //         const dx = balloon.x - mouseX;
    //         const dy = (balloon.y + Math.sin(balloon.floatPhase) * balloon.floatAmount) - mouseY;
    //         const distance = Math.sqrt(dx * dx + dy * dy);
    //
    //         // Balloon hit radius based on size
    //         const hitRadius = 50 * balloon.size;
    //
    //         if (distance < hitRadius) {
    //             hoveringBalloonIds.add(balloon.id);
    //         }
    //     });
    //
    //     // Second pass: update hovering state and zIndex
    //     balloonsRef.current = balloonsRef.current.map(balloon => {
    //         const isHovering = hoveringBalloonIds.has(balloon.id);
    //
    //         // Update zIndex for proper layering
    //         // If this balloon is hovering, it gets a high zIndex
    //         // Otherwise, it keeps its original zIndex
    //         const newZIndex = isHovering ? 100 : 0;
    //
    //         return {
    //             ...balloon,
    //             hovering: isHovering,
    //             zIndex: isHovering ? newZIndex : balloon.zIndex
    //         };
    //     });
    // };

    // Handle dragging movement
    // const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>): void => {
    //     const canvas = canvasRef.current;
    //     if (!canvas) return;
    //
    //     const rect = canvas.getBoundingClientRect();
    //     const mouseX = e.clientX - rect.left;
    //     const mouseY = e.clientY - rect.top;
    //
    //     if (draggingBalloonId !== null) {
    //         // Update position of dragging balloon
    //         balloonsRef.current = balloonsRef.current.map(balloon => {
    //             if (balloon.id === draggingBalloonId && !balloon.popped) {
    //                 return {
    //                     ...balloon,
    //                     x: mouseX,
    //                     y: mouseY,
    //                     zIndex: 100,  // Keep dragging balloon on top
    //                 };
    //             }
    //             return balloon;
    //         });
    //     } else {
    //         // Existing hover logic
    //         const hoveringBalloonIds = new Set<number>();
    //         balloonsRef.current.forEach(balloon => {
    //             if (balloon.popped) return;
    //             const dx = balloon.x - mouseX;
    //             const dy = (balloon.y + Math.sin(balloon.floatPhase) * balloon.floatAmount) - mouseY;
    //             const distance = Math.sqrt(dx * dx + dy * dy);
    //             const hitRadius = 50 * balloon.size;
    //             if (distance < hitRadius) {
    //                 hoveringBalloonIds.add(balloon.id);
    //             }
    //         });
    //
    //         balloonsRef.current = balloonsRef.current.map(balloon => {
    //             const isHovering = hoveringBalloonIds.has(balloon.id);
    //             return {
    //                 ...balloon,
    //                 hovering: isHovering,
    //                 zIndex: isHovering ? 100 : 0
    //             };
    //         });
    //     }
    // };
    //
    // const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>): void => {
    //     const canvas = canvasRef.current;
    //     if (!canvas) return;
    //
    //     const rect = canvas.getBoundingClientRect();
    //     const clickX = e.clientX - rect.left;
    //     const clickY = e.clientY - rect.top;
    //
    //     const topmostBalloon = findTopmostBalloon(clickX, clickY);
    //
    //     if (topmostBalloon) {
    //         const currentTime = Date.now();
    //         const timeSinceLastClick = currentTime - lastClickTime;
    //
    //         // Check if this is a double click (within 300ms)
    //         if (timeSinceLastClick < 300 && lastClickBalloonId === topmostBalloon.id) {
    //             popBalloon(topmostBalloon.id);
    //             setLastClickTime(0);
    //             setLastClickBalloonId(null);
    //         } else {
    //             // Start dragging
    //             setDraggingBalloonId(topmostBalloon.id);
    //             balloonsRef.current = balloonsRef.current.map(balloon => ({
    //                 ...balloon,
    //                 isDragging: balloon.id === topmostBalloon.id,
    //                 pressing: balloon.id === topmostBalloon.id
    //             }));
    //             setLastClickTime(currentTime);
    //             setLastClickBalloonId(topmostBalloon.id);
    //         }
    //     }
    // };
    // const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>): void => {
    //     const canvas = canvasRef.current;
    //     if (!canvas) return;
    //
    //     const rect = canvas.getBoundingClientRect();
    //     const mouseX = e.clientX - rect.left;
    //     const mouseY = e.clientY - rect.top;
    //
    //     if (draggingBalloonId !== null) {
    //         // Update position of dragging balloon
    //         balloonsRef.current = balloonsRef.current.map(balloon => {
    //             if (balloon.id === draggingBalloonId && !balloon.popped) {
    //                 return {
    //                     ...balloon,
    //                     x: mouseX,
    //                     y: mouseY,
    //                     zIndex: 100,
    //                 };
    //             }
    //             return balloon;
    //         });
    //     } else {
    //         // Hover logic
    //         const hoveringBalloonIds = new Set<number>();
    //         balloonsRef.current.forEach(balloon => {
    //             if (balloon.popped) return;
    //             const dx = balloon.x - mouseX;
    //             const dy = (balloon.y + Math.sin(balloon.floatPhase) * balloon.floatAmount) - mouseY;
    //             const distance = Math.sqrt(dx * dx + dy * dy);
    //             const hitRadius = 50 * balloon.size;
    //             if (distance < hitRadius) {
    //                 hoveringBalloonIds.add(balloon.id);
    //             }
    //         });
    //
    //         balloonsRef.current = balloonsRef.current.map(balloon => {
    //             const isHovering = hoveringBalloonIds.has(balloon.id);
    //             return {
    //                 ...balloon,
    //                 hovering: isHovering,
    //                 zIndex: isHovering ? 100 : 0
    //             };
    //         });
    //     }
    // };
    // const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>): void => {
    //     // Reset dragging states
    //     balloonsRef.current = balloonsRef.current.map(balloon => ({
    //         ...balloon,
    //         isDragging: false,
    //         pressing: false
    //     }));
    //     setDraggingBalloonId(null);
    // };
    //

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

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>): void => {
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
    };

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

    // Get color name
    const getColorName = (hexColor: string): string => {
        return colorNames[hexColor] || "Colorful";
    };

    return (
        <div className="flex items-center justify-center h-96 w-full bg-gradient-to-b from-blue-300 to-teal-300 overflow-hidden">
            {/* Audio element for pop sound */}
            <audio ref={audioRef} preload="auto" className="hidden">
                {/* Pop sound would go here */}
            </audio>

            <div className="relative w-full h-full">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full cursor-pointer"
                    // onClick={handleCanvasClick}
                    onMouseMove={handleMouseMove}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                />
            </div>

            {/* Balloon Pop Dialog */}
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-bold">
                            {title}
                        </AlertDialogTitle>
                        <AlertDialogDescription
                            className="text-lg">
                            {/* Move content outside <p> tag that AlertDialogDescription creates */}
                        </AlertDialogDescription>

                        {/* Place content directly in AlertDialogHeader */}
                        <div className="flex flex-col items-center gap-4 py-4">
                            <div
                                className="w-16 h-16 rounded-full mb-2"
                                style={{ backgroundColor: activeColor }}
                            ></div>
                            <div>
                                You popped the phoneme <span className="font-bold text-4xl" style={{ color: activeColor }}>{activePhoneme}</span>
                            </div>
                            <div>
                                (<span className="font-bold" style={{ color: activeColor }}>{getColorName(activeColor)}</span> balloon)
                            </div>

                            {stats.streak > 1 && (
                                <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg mt-2">
                                    <div className="font-bold">Streak: {stats.streak} 🔥</div>
                                </div>
                            )}

                            <div className="text-sm text-gray-600 mt-4">
                                {description}
                            </div>
                        </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={handleCloseDialog} className="bg-blue-500 hover:bg-blue-600 text-white">
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default BalloonField;
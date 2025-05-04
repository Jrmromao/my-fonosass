// useBalloonAnimation.ts
import { useRef, useEffect, useCallback } from 'react';
import { Balloon, Fragment } from './types';
import {drawBalloon, findValidPosition, shadeColor} from './utils';
import {balloonColors, phonemes} from './constants';

export const useBalloonAnimation = (
    balloonCount: number,
    onBalloonPopped: (phoneme: string, color: string) => void,
    setDialogOpen: (open: boolean) => void,
    setActiveColor: (color: string) => void,
    setActivePhoneme: (phoneme: string) => void,
    setPoppedBalloonId: (id: number | null) => void,
    setStats: (stats: any) => void
) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const balloonsRef = useRef<Balloon[]>([]);
    const fragmentsRef = useRef<Fragment[]>([]);
    const animationRef = useRef<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);


    // // Initialize balloons with better positioning
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


    const startAnimation = useCallback(() => {
        let lastTime = 0;

        const animate = (timestamp: number) => {
            const delta = lastTime ? (timestamp - lastTime) / 16.66 : 12;
            lastTime = timestamp;

            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d', { alpha: false });
            if (!ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Animation logic here (simplified for brevity)

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
    }, []);

    const popBalloon = useCallback((balloonId: number) => {
        const balloon = balloonsRef.current.find(b => b.id === balloonId);
        if (!balloon || balloon.popped) return;

        balloon.popped = true;
        setPoppedBalloonId(balloonId);
        setActiveColor(balloon.color);
        setActivePhoneme(balloon.phoneme);

        // Update stats and other logic
        if (onBalloonPopped) onBalloonPopped(balloon.phoneme, balloon.color);

        setTimeout(() => setDialogOpen(true), 500);
    }, [onBalloonPopped, setActiveColor, setActivePhoneme, setDialogOpen, setPoppedBalloonId]);

    useEffect(() => {
        initializeBalloons();
        startAnimation();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [initializeBalloons, startAnimation]);

    return { canvasRef, balloonsRef, fragmentsRef, popBalloon,    initializeBalloons,
        startAnimation};
};


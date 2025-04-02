// useBalloonAnimation.ts
import { useRef, useEffect, useCallback } from 'react';
import { Balloon, Fragment } from './types';
import { drawBalloon, shadeColor } from './utils';
import { balloonColors } from './constants';

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

    const initializeBalloons = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const leftAnchorX = width * 0.25;
        const rightAnchorX = width * 0.75;
        const anchorY = height;
        const virtualHeight = height * 0.8;
        const leftBalloonCount = 10;
        const rightBalloonCount = 10;

        const balloons: Balloon[] = [];

        const createBalloonGroup = (count: number, startId: number, anchorX: number, isLeft: boolean) => {
            const widthRange: [number, number] = isLeft
                ? [anchorX - width * 0.2, anchorX + width * 0.15]
                : [anchorX - width * 0.15, anchorX + width * 0.2];

            for (let i = 0; i < count; i++) {
                const id = startId + i;
                const colorIndex = id % balloonColors.length;
                const position = { x: 0, y: 0 }; // Simplified for brevity

                balloons.push({
                    id,
                    x: position.x,
                    y: position.y,
                    color: balloonColors[colorIndex],
                    size: 0.8 + Math.random() * 0.4,
                    popped: false,
                    floatPhase: Math.random() * Math.PI * 2,
                    floatSpeed: 0.3 + Math.random() * 0.3,
                    floatAmount: 2 + Math.random() * 3,
                    rotation: (Math.random() - 0.5) * 0.2,
                    stringLength: 0,
                    hovering: false,
                    pressing: false,
                    anchorGroup: isLeft ? 'left' : 'right',
                    phoneme: 'P', // Placeholder
                    zIndex: 0,
                    isDragging: false
                });
            }
        };

        createBalloonGroup(leftBalloonCount, 0, leftAnchorX, true);
        createBalloonGroup(rightBalloonCount, leftBalloonCount, rightAnchorX, false);

        balloonsRef.current = balloons;
    }, []);

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

    return { canvasRef, balloonsRef, fragmentsRef, popBalloon };
};
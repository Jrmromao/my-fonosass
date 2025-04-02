// utils.ts
import { Balloon } from './types';

export const shadeColor = (color: string, percent: number): string => {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = Math.min(255, Math.max(0, Math.round(R * (1 + percent / 100))));
    G = Math.min(255, Math.max(0, Math.round(G * (1 + percent / 100))));
    B = Math.min(255, Math.max(0, Math.round(B * (1 + percent / 100))));

    return `#${R.toString(16).padStart(2, '0')}${G.toString(16).padStart(2, '0')}${B.toString(16).padStart(2, '0')}`;
};

export const getBadgeVariant = {
    difficulty: (difficulty: string) => {
        const variants: { [key: string]: string } = {
            "BEGINNER": "success",
            "INTERMEDIATE": "warning",
            "ADVANCED": "destructive",
            "default": "secondary"
        };
        return variants[difficulty] || variants.default;
    },
    type: (type: string) => "secondary",
    ageRange: (ageRange: string) => {
        const variants: { [key: string]: string } = {
            "TODDLER": "success",
            "PRESCHOOL": "warning",
            "ADULT": "default",
            "default": "secondary"
        };
        return variants[ageRange] || variants.default;
    }
};

export const checkOverlap = (balloon1: Balloon, balloon2: Balloon): boolean => {
    const dx = balloon1.x - balloon2.x;
    const dy = balloon1.y - balloon2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const size1 = 50 * balloon1.size;
    const size2 = 50 * balloon2.size;
    const maxOverlap = (size1 + size2) * 0.3;

    return distance < maxOverlap;
};

export const findValidPosition = (
    balloons: Balloon[],
    widthRange: [number, number],
    heightRange: [number, number],
    maxAttempts: number = 50
): { x: number; y: number } => {
    let x = widthRange[0] + Math.random() * (widthRange[1] - widthRange[0]);
    let y = heightRange[0] + Math.random() * (heightRange[1] - heightRange[0]);
    let isValid = false;
    let attempts = 0;

    while (!isValid && attempts < maxAttempts) {
        x = widthRange[0] + Math.random() * (widthRange[1] - widthRange[0]);
        y = heightRange[0] + Math.random() * (heightRange[1] - heightRange[0]);

        isValid = true;
        for (const balloon of balloons) {
            const dx = balloon.x - x;
            const dy = balloon.y - y;
            if (dx * dx + dy * dy > 10000) continue;

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

    return { x, y };
};

export const drawBalloon = (
    ctx: CanvasRenderingContext2D,
    balloon: Balloon,
    floatY: number,
    anchorX: number,
    anchorY: number
): void => {
    // (Keep the existing drawBalloon function here, adjusted as needed)
    const { x, y, color, size, rotation, hovering, pressing } = balloon;

    const balloonWidth = 100 * size;
    const balloonHeight = 120 * size;

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

    ctx.beginPath();
    ctx.ellipse(0, 0, balloonWidth / 2, balloonHeight / 2, 0, 0, Math.PI * 2);

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

    ctx.strokeStyle = shadeColor(color, -30);
    ctx.lineWidth = 2 * (size / 0.8);
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Highlights and tie (simplified for brevity)

    ctx.restore();

    // String drawing (simplified)
    ctx.save();
    const balloonBottom = balloonY + (balloonHeight / 2 + 10) * scaleY;
    ctx.beginPath();
    ctx.moveTo(anchorX, anchorY);
    const stringMidX = (x + anchorX) / 2;
    const stringMidY = (balloonBottom + anchorY) / 2 + Math.sin(balloon.floatPhase / 2) * 8;
    ctx.quadraticCurveTo(stringMidX, stringMidY + 15, x, balloonBottom);
    ctx.strokeStyle = shadeColor(color, -40);
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
};
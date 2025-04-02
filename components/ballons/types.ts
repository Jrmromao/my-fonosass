// types.ts
export interface Balloon {
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
    anchorGroup: 'left' | 'right';
    phoneme: string;
    zIndex: number;
    isDragging: boolean;
}

export interface Fragment {
    type: 'rubber' | 'dust';
    size: number;
    x: number;
    y: number;
    originX: number;
    originY: number;
    velocity: { x: number; y: number };
    rotation: number;
    rotationSpeed: number;
    opacity: number;
    color: string;
}

export interface ActivityFile {
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

export interface ActivityWithFiles extends Activity {
    files?: ActivityFile[];
}

export enum ActivityDifficulty {
    BEGINNER = "BEGINNER",
    INTERMEDIATE = "INTERMEDIATE",
    ADVANCED = "ADVANCED",
}

export enum ActivityType {
    // Define your enum values
}

export enum AgeRange {
    TODDLER = "TODDLER",
    PRESCHOOL = "PRESCHOOL",
    ADULT = "ADULT",
}

export interface ColorMapping {
    [key: string]: string;
}

export interface BalloonFieldProps {
    balloonCount?: number;
    title?: string;
    description?: string;
    onBalloonPopped?: (phoneme: string, color: string) => void;
}
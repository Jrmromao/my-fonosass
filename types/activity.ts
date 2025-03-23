// Create a shared types file: types/activity.ts

import { Activity, ActivityDifficulty, ActivityType, AgeRange } from "@prisma/client";

// Define the standard activity with files interface
export interface ActivityWithFiles {
    id: string;
    name: string;
    description: string;
    type: ActivityType;
    difficulty: ActivityDifficulty;
    phoneme: string;
    ageRange: AgeRange;
    isPublic: boolean;
    createdById: string;
    createdAt: Date;
    updatedAt: Date;

    // Related fields with optional flags
    createdBy?: {
        fullName: string;
    };

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

    categories?: Array<{
        id: string;
        name: string;
    }>;
}

// Type guard to check if an object is an ActivityWithFiles
export function isActivityWithFiles(obj: any): obj is ActivityWithFiles {
    return obj &&
        typeof obj.id === 'string' &&
        typeof obj.name === 'string' &&
        typeof obj.type === 'string';
}
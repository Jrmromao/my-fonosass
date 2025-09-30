import { Activity } from '@prisma/client';

export interface Balloon {
  id: number;
  x: number;
  y: number;
  vx: number; // velocity x
  vy: number; // velocity y
  radius: number; // radius for physics calculations
  color: string;
  size: number;
  popped: boolean;
  popTime?: number; // time when balloon was popped
  fragments?: Fragment[]; // fragments for explosion effect
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
  isDragging: boolean; // New property to track dragging state
  // Enhanced animation properties
  rotationPhase: number;
  rotationSpeed: number;
  scalePhase: number;
  scaleSpeed: number;
  scaleAmount: number;
  swayPhase: number;
  swaySpeed: number;
  swayAmount: number;
  colorPhase: number;
  colorSpeed: number;
}

export interface Fragment {
  type: 'rubber' | 'dust';
  size: number;
  x: number;
  y: number;
  vx: number; // velocity x
  vy: number; // velocity y
  life: number; // life remaining (0-1)
  alpha: number; // opacity (0-1)
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

// Activity file type
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

// Define an extended Activity type that includes files
export interface ActivityWithFiles extends Activity {
  files?: ActivityFile[];
}

export interface BalloonFieldProps {
  balloonCount?: number;
  title?: string;
  description?: string;
  onBalloonPopped?: (phoneme: string, color: string) => void;
}

// -----

export enum ActivityDifficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum ActivityType {
  // Define your enum values
}

export enum AgeRange {
  TODDLER = 'TODDLER',
  PRESCHOOL = 'PRESCHOOL',
  ADULT = 'ADULT',
}

export interface ColorMapping {
  [key: string]: string;
}

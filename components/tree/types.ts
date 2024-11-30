// types.ts
import { LucideIcon } from 'lucide-react';

export interface Activity {
    title: string;
    steps: string[];
}

export interface Phoneme {
    sound: string;
    examples: string[];  // Changed from Example[] to string[]
    type: 'vogal' | 'consoante' | 'dígrafo' | 'encontro consonantal';
    color: string;
    hint: string;
    level: 'fácil' | 'médio' | 'difícil';
    mouthPosition: string;
    activities: Activity[];
}

export interface Position {
    x: number;
    y: number;
}

export interface Letter {
    char: string;
    position: Position;
    color: string;
    phonemes: Phoneme[];
    IconComponent?: LucideIcon;
    icon?: string;
}

export interface AppleProps {
    letter: Letter;
    onClick: (letter: Letter) => void;
    isSelected: boolean;
}

export interface TreeBranchProps {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    thickness?: number;
}

export interface PhonemeCardProps {
    phoneme: Phoneme;
    onClose: () => void;
}

export interface LeafClusterProps {
    x: number;
    y: number;
    rotation?: number;
    scale?: number;
}
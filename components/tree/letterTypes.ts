// letterTypes.ts
import { Phoneme } from './types';

export interface Position {
    x: number;
    y: number;
}

export interface Letter {
    char: string;
    position: Position;
    color: string;
    phonemes: Phoneme[];
}

export interface AppleProps {
    letter: Letter;
    onClick: (letter: Letter) => void;
    isSelected: boolean;
}
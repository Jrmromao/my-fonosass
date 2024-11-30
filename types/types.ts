// types/form.ts
import {LucideIcon} from "lucide-react";

export interface FieldOption {
    id: string
    label: string
    value: string
}

export interface FormField {
    id: string
    name: string
    label: string
    type: string
    required: boolean
    placeholder: string
    description: string
    options: FieldOption[]
    validation?: {
        min?: number
        max?: number
        minLength?: number
        maxLength?: number
        pattern?: string
    }
    x: number       // x position in pixels
    y: number       // y position in pixels
    width: number   // width in pixels
    height: number  // height in pixels

}

export interface Form {
    title: string
    description: string
    fields: FormField[]
}

export type FieldType = 'text' | 'number' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio'

export const FIELD_TYPES: { value: FieldType; label: string }[] = [
    { value: 'text', label: 'Text Input' },
    { value: 'number', label: 'Number Input' },
    { value: 'email', label: 'Email Input' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'select', label: 'Select Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Radio Buttons' }
]
export const A4_WIDTH = 794  // 210mm * 96px/25.4mm
export const A4_HEIGHT = 1123 // 297mm * 96px/25.4mm

export interface Page {
    id: string
    title: string
    description?: string
    fields: PageField[]
}

export interface PageField {
    id: string
    type: FieldType
    name: string
    label: string
    required: boolean
    placeholder: string
    description: string
    options: FieldOption[]
    // Position and dimensions on A4
    x: number       // x position in pixels
    y: number       // y position in pixels
    width: number   // width in pixels
    height: number  // height in pixels
    validation?: {
        min?: number
        max?: number
        minLength?: number
        maxLength?: number
        pattern?: string
    }
}

export interface ClockSection {
    num: number;
    text: string;
    color: string;
    textColor: string;
    animal: string;
    icon?: string;
    IconComponent?: LucideIcon;
    funWord: string;
    practiceWord: string;
    funFact: string;
    soundTip: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    syllables?: string[];
}


export interface Phoneme {
    sound: string;
    examples: {
        word: string;
        sentence: string;
    }[];
    type: 'vogal' | 'consoante' | 'dígrafo' | 'encontro consonantal';
    color: string;
    hint: string;
    level: 'fácil' | 'médio' | 'difícil';
    mouthPosition: string;
    activities: {
        title: string;
        steps: string[];
    }[];
}
export interface Example {
    word: string;
    sentence: string;
}

export interface Example {
    word: string;
    sentence: string;
}

export interface Activity {
    title: string;
    steps: string[];
}

export interface Phoneme {
    sound: string;
    examples: Example[];
    type: 'vogal' | 'consoante' | 'dígrafo' | 'encontro consonantal';
    color: string;
    hint: string;
    level: 'fácil' | 'médio' | 'difícil';
    mouthPosition: string;
    activities: Activity[];
}

export interface PhonemeCardProps {
    phoneme: Phoneme;
    onClose: () => void;
}
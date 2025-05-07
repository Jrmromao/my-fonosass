import {Stripe} from "stripe";
import {Option} from "@/types/activity";

export const APP_NAME = 'App do Joao'


export enum Role {
    ADMIN = 'ADMIN',
    USER = 'USER'
}


// constants.ts
export const phonemes: string[] = [
    "P", "L", "K", "T", "S", "CH", "LH", "F", "B", "N", "G", "D", "Z",
    "J", "NH", "V", "M", "R", "ARQ", "C/R/V", "C/L/V", "Vogais"
];


export const activityTypes: Option[] = [
    { value: "ANIMALS", label: "Animais" },
    { value: "COLOURS", label: "Cores" }, // Using UK/Ireland spelling for the value
    { value: "MEANS_OF_TRANSPORT", label: "Meios de Transporte" },
    { value: "CLOTHING", label: "Vestuário" },
    { value: "LANGUAGE", label: "Linguagem" },
    { value: "PROFESSIONS", label: "Profissões" },
    { value: "GEOMETRIC_SHAPES", label: "Figuras Geométricas" },
    { value: "NUMBERS_AND_LETTERS", label: "Números e Letras" },
    { value: "MOTOR_SKILLS", label: "Motricidade" },
    { value: "HUMAN_BODY", label: "Corpo Humano" },
];






export const difficultyLevels: Option[] = [
    { value: "BEGINNER", label: "Iniciante" },
    { value: "INTERMEDIATE", label: "Intermediário" },
    { value: "ADVANCED", label: "Avançado" },
    { value: "EXPERT", label: "Especialista" }
]

export const ageRanges: Option[] = [
    { value: "TODDLER", label: "Bebês (1-3 anos)" },
    { value: "PRESCHOOL", label: "Pré-escolar (3-5 anos)" },
    { value: "CHILD", label: "Criança (6-12 anos)" },
    { value: "TEENAGER", label: "Adolescente (13-17 anos)" },
    { value: "ADULT", label: "Adulto (18+ anos)" }
]

export const balloonColors: string[] = [
    "#ff3333", "#ff9933", "#ffff33", "#33ff33", "#33ffff", "#3333ff", "#9933ff",
    "#ff33ff", "#ff3399", "#99ff33", "#33ff99", "#9999ff", "#ff9999", "#ffcc33",
    "#33ccff", "#cc33ff", "#ffcc99", "#99ffcc", "#cc99ff", "#33cc33", "#ff3366",
    "#66ff33", "#33cccc"
];

interface ColorMapping {
    [key: string]: string;
}

export const colorNames: ColorMapping = {
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


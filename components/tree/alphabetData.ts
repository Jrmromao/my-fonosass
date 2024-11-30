// alphabetData.ts
import { Letter, Phoneme } from './types';

const basePhonemes: Phoneme[] = [
    {
        sound: 'a',
        examples: [

        ],
        type: 'vogal',
        color: '#FF6B6B',
        hint: 'Abra bem a boca',
        level: 'fácil',
        mouthPosition: 'Boca bem aberta, língua relaxada',
        activities: [
            {
                title: 'Repetição',
                steps: [
                    'Repita: A - A - A',
                    'Fale devagar',
                    'Agora mais rápido'
                ]
            }
        ]
    }
];

export const alphabetData: Letter[] = [
    // Left cluster
    {
        char: 'A',
        position: { x: 200, y: 140 },
        color: '#FF6B6B',
        phonemes: basePhonemes
    },
    {
        char: 'B',
        position: { x: 240, y: 120 },
        color: '#87CEEB',
        phonemes: basePhonemes
    },
    {
        char: 'C',
        position: { x: 220, y: 160 },
        color: '#FFD700',
        phonemes: basePhonemes
    },
    {
        char: 'D',
        position: { x: 260, y: 140 },
        color: '#FF9A9E',
        phonemes: basePhonemes
    },
    {
        char: 'E',
        position: { x: 240, y: 170 },
        color: '#98FB98',
        phonemes: basePhonemes
    },
    // ... (rest of the letters with proper types)
];
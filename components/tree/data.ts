// // data.ts
// import {Letter, Phoneme} from './types';
//
// export const alphabetData: Letter[] = [
//     {
//         char: 'A',
//         phonemes: [
//             {
//                 sound: 'ɑ',
//                 examples: ['avó', 'asa', 'casa'],
//                 type: 'vowel',
//                 color: '#FF6B6B',
//                 hint: 'Abra bem a boca, como no médico!',
//                 level: 'easy'
//             },
//             {
//                 sound: 'ɐ',
//                 examples: ['amor', 'amigo', 'anel'],
//                 type: 'vowel',
//                 color: '#4ECDC4',
//                 hint: 'Som mais fechado, como em "amigo"',
//                 level: 'medium'
//             }
//         ],
//         position: {x: 200, y: 150},
//         color: '#FF6B6B'
//     },
//     {
//         char: 'B',
//         phonemes: [
//             {
//                 sound: 'b',
//                 examples: ['bola', 'bebê', 'barco'],
//                 type: 'consonant',
//                 color: '#95E1D3',
//                 hint: 'Junte os lábios e solte o ar!',
//                 level: 'easy'
//             }
//         ],
//         position: {x: 300, y: 200},
//         color: '#95E1D3'
//     },
//     // ... more letters with their positions and phonemes
// ];
//
// export const treeStructure = {
//     trunk: {
//         startX: 400,
//         startY: 600,
//         endX: 400,
//         endY: 400,
//         thickness: 40
//     },
//     mainBranches: [
//         {
//             startX: 400,
//             startY: 400,
//             endX: 300,
//             endY: 350,
//             thickness: 20
//         },
//         {
//             startX: 400,
//             startY: 400,
//             endX: 500,
//             endY: 350,
//             thickness: 20
//         }
//         // ... more branch definitions
//     ]
// };
//
// export const letterPhonemes: Record<string, Phoneme[]> = {
//     'A': [
//         {
//             sound: 'a',
//             examples: [
//                 {
//                     word: 'abelha',
//                     sentence: 'A abelha faz mel'
//                 },
//                 {
//                     word: 'avião',
//                     sentence: 'O avião voa alto'
//                 },
//                 {
//                     word: 'água',
//                     sentence: 'Bebo água todos os dias'
//                 }
//             ],
//             type: 'vogal',
//             color: '#FF6B6B',
//             hint: 'Abra bem a boca, como quando o médico pede para dizer "Ahh"',
//             level: 'fácil',
//             mouthPosition: 'Boca bem aberta, língua relaxada',
//             activities: [
//                 {
//                     title: 'Repetição Gradual',
//                     steps: [
//                         'Diga "A" sozinho 3 vezes',
//                         'Repita as palavras devagar',
//                         'Tente falar mais rápido'
//                     ]
//                 },
//                 {
//                     title: 'Brincadeira com Espelho',
//                     steps: [
//                         'Olhe no espelho',
//                         'Observe sua boca abrir',
//                         'Mantenha o som por 3 segundos'
//                     ]
//                 }
//             ]
//         },
//         {
//             sound: 'ã',
//             examples: [
//                 {
//                     word: 'maçã',
//                     sentence: 'A maçã está madura'
//                 },
//                 {
//                     word: 'manhã',
//                     sentence: 'Bom dia, boa manhã!'
//                 },
//                 {
//                     word: 'irmã',
//                     sentence: 'Minha irmã é legal'
//                 }
//             ],
//             type: 'vogal',
//             color: '#FF6B6B',
//             hint: 'Som nasal, como se estivesse resfriado',
//             level: 'médio',
//             mouthPosition: 'Boca aberta, ar sai pelo nariz',
//             activities: [
//                 {
//                     title: 'Exercício Nasal',
//                     steps: [
//                         'Tape um lado do nariz',
//                         'Faça o som "ã"',
//                         'Sinta a vibração'
//                     ]
//                 }
//             ]
//         }
//     ],
//     'B': [
//         {
//             sound: 'b',
//             // examples: [
//             //     {
//             //         word: 'bola',
//             //         sentence: 'A bola é azul'
//             //     },
//             //     {
//             //         word: 'barco',
//             //         sentence: 'O barco navega no mar'
//             //     },
//             //     {
//             //         word: 'bebê',
//             //         sentence: 'O bebê está dormindo'
//             //     }
//             // ],
//             type: 'consoante',
//             color: '#4ECDC4',
//             hint: 'Junte os lábios e solte rápido',
//             level: 'fácil',
//             mouthPosition: 'Lábios fechados, depois abrem rapidamente',
//             activities: [
//                 {
//                     title: 'Jogo do Sopro',
//                     steps: [
//                         'Coloque papel na frente da boca',
//                         'Fale "BA" forte',
//                         'Veja o papel se mover'
//                     ]
//                 }
//             ]
//         }
//     ]
//     // Add more letters as needed
// };

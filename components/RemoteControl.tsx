// import React from 'react';
// import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog';
// import {Button} from '@/components/ui/button';
// import {Card} from '@/components/ui/card';
// import {Badge} from '@/components/ui/badge';
// import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
// import {Phoneme} from "@/types/types";
//
// // Updated data structure for phonemes
// const phonemeData = {
//     bilabials: [
//         {
//             sound: 'P',
//             word: 'Papai',
//             example: 'PA-pai',
//             color: '#FF6B6B',
//             icon: '👄',
//             animal: 'Pato',
//             funWord: 'PA PA PA!',
//             practiceWord: 'PA-TO',
//             funFact: 'Junte os lábios e solte o ar rapidinho!',
//             soundTip: 'Como estourar uma bolha: P!',
//             level: 'iniciante'
//         },
//         {
//             sound: 'B',
//             word: 'Bebê',
//             example: 'BE-bê',
//             color: '#4ECDC4',
//             icon: '👶',
//             animal: 'Boi',
//             funWord: 'BA BA BA!',
//             practiceWord: 'BO-I',
//             funFact: 'Junte os lábios e faça eles vibrarem!',
//             soundTip: 'Como um balão estourando: B!',
//             level: 'iniciante'
//         },
//         {
//             sound: 'M',
//             word: 'Mamãe',
//             example: 'MA-mãe',
//             color: '#FFD93D',
//             icon: '👩',
//             animal: 'Macaco',
//             funWord: 'MM MM!',
//             practiceWord: 'MA-CA-CO',
//             funFact: 'Junte os lábios e faça um som de gostoso!',
//             soundTip: 'Como saborear algo gostoso: MMM!',
//             level: 'iniciante'
//         }
//     ],
//     linguodentals: [
//         {
//             sound: 'T',
//             word: 'Tatu',
//             example: 'TA-tu',
//             color: '#FF8B94',
//             icon: '🦡',
//             animal: 'Tatu',
//             funWord: 'TA TA TA!',
//             practiceWord: 'TA-TU',
//             funFact: 'Coloque a língua atrás dos dentes!',
//             soundTip: 'Como uma gotinha caindo: T!',
//             level: 'iniciante'
//         },
//         {
//             sound: 'D',
//             word: 'Dado',
//             example: 'DA-do',
//             color: '#A8E6CF',
//             icon: '🎲',
//             animal: 'Dinossauro',
//             funWord: 'DA DA DA!',
//             practiceWord: 'DA-DO',
//             funFact: 'Toque a língua nos dentes de cima!',
//             soundTip: 'Como bater um tambor: D!',
//             level: 'iniciante'
//         },
//         {
//             sound: 'N',
//             word: 'Nariz',
//             example: 'NA-riz',
//             color: '#DCC0FF',
//             icon: '👃',
//             animal: 'Navio',
//             funWord: 'NA NA NA!',
//             practiceWord: 'NA-VIO',
//             funFact: 'O som sai pelo nariz!',
//             soundTip: 'Como fazer um zumbido: N!',
//             level: 'iniciante'
//         }
//     ],
//     velars: [
//         {
//             sound: 'K',
//             word: 'Casa',
//             example: 'CA-sa',
//             color: '#FFB347',
//             icon: '🏠',
//             animal: 'Cachorro',
//             funWord: 'CA CA CA!',
//             practiceWord: 'CA-SA',
//             funFact: 'O som vem lá do fundo da boca!',
//             soundTip: 'Como tossir: K!',
//             level: 'intermediário'
//         },
//         {
//             sound: 'G',
//             word: 'Gato',
//             example: 'GA-to',
//             color: '#98FB98',
//             icon: '🐱',
//             animal: 'Gato',
//             funWord: 'GA GA GA!',
//             practiceWord: 'GA-TO',
//             funFact: 'Faça o som na garganta!',
//             soundTip: 'Como um gargarejo: G!',
//             level: 'intermediário'
//         }
//     ],
//     fricatives: [
//         {
//             sound: 'F',
//             word: 'Foca',
//             example: 'FO-ca',
//             color: '#87CEEB',
//             icon: '🦭',
//             animal: 'Foca',
//             funWord: 'FFF!',
//             practiceWord: 'FO-CA',
//             funFact: 'Morda o lábio de baixo levemente!',
//             soundTip: 'Como soprar uma vela: F!',
//             level: 'intermediário'
//         },
//         {
//             sound: 'V',
//             word: 'Vaca',
//             example: 'VA-ca',
//             color: '#FFA07A',
//             icon: '🐮',
//             animal: 'Vaca',
//             funWord: 'VVV!',
//             practiceWord: 'VA-CA',
//             funFact: 'Use os dentes e o lábio!',
//             soundTip: 'Como o vento soprando: V!',
//             level: 'intermediário'
//         },
//         {
//             sound: 'S',
//             word: 'Sapo',
//             example: 'SA-po',
//             color: '#77DD77',
//             icon: '🐸',
//             animal: 'Sapo',
//             funWord: 'SSS!',
//             practiceWord: 'SA-PO',
//             funFact: 'Faça um som de cobrinha!',
//             soundTip: 'Como uma cobra: SSS!',
//             level: 'avançado'
//         }
//     ]
// };
//
// const SpeechRemote: React.FC = () => {
//     const [selectedPhoneme, setSelectedPhoneme] = React.useState<Phoneme>(null);
//     const [open, setOpen] = React.useState(false);
//
//     return (
//         <div className="w-full max-w-2xl mx-auto p-4">
//             <Tabs defaultValue="bilabials" className="w-full">
//                 <TabsList className="grid w-full grid-cols-4 mb-4">
//                     <TabsTrigger value="bilabials">Bilabiais</TabsTrigger>
//                     <TabsTrigger value="linguodentals">Linguodentais</TabsTrigger>
//                     <TabsTrigger value="velars">Velares</TabsTrigger>
//                     <TabsTrigger value="fricatives">Fricativas</TabsTrigger>
//                 </TabsList>
//
//                 {/* Remote Control Body */}
//                 {Object.entries(phonemeData).map(([category, phonemes]) => (
//                     <TabsContent key={category} value={category}>
//                         <div className="bg-gray-800 rounded-[40px] p-6 shadow-2xl relative">
//                             {/* IR Blaster */}
//                             <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8">
//                                 <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
//                                     <div className="w-4 h-4 bg-gray-900 rounded-full" />
//                                 </div>
//                             </div>
//
//                             {/* Display Area */}
//                             <div className="bg-gray-700 rounded-2xl p-4 mb-6 mt-4">
//                                 <div className="text-center text-white text-2xl font-bold">
//                                     {selectedPhoneme ? `${selectedPhoneme.sound} - ${selectedPhoneme.word}` : "Escolha um Som!"}
//                                 </div>
//                             </div>
//
//                             {/* Phoneme Grid */}
//                             <div className="grid grid-cols-2 gap-4">
//                                 {phonemes.map((phoneme) => (
//                                     <Button
//                                         key={phoneme.sound}
//                                         variant="outline"
//                                         className="h-20 relative rounded-xl bg-gradient-to-b from-gray-700 to-gray-800 border-2 hover:scale-105 transition-transform"
//                                         style={{
//                                             borderColor: selectedPhoneme?.sound === phoneme.sound ? phoneme.color : 'rgb(75, 85, 99)'
//                                         }}
//                                         onClick={() => {
//                                             setSelectedPhoneme(phoneme);
//                                             setOpen(true);
//                                         }}
//                                     >
//                                         <div className="absolute inset-0 flex flex-col items-center justify-center">
//                       <span className="text-3xl font-bold mb-1" style={{ color: phoneme.color }}>
//                         {phoneme.sound}
//                       </span>
//                                             <span className="text-sm text-white">
//                         {phoneme.example}
//                       </span>
//                                             <span className="text-2xl mt-1">{phoneme.icon}</span>
//                                         </div>
//                                         <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-xl pointer-events-none" />
//                                     </Button>
//                                 ))}
//                             </div>
//
//                             {/* Help Section */}
//                             <div className="mt-6 bg-gray-700 rounded-xl p-4 text-white text-sm">
//                                 <h3 className="font-bold mb-2">Como usar:</h3>
//                                 <ul className="space-y-1 text-gray-300">
//                                     <li>• Clique em um som para praticar</li>
//                                     <li>• Siga as instruções na tela</li>
//                                     <li>• Repita os exercícios várias vezes</li>
//                                 </ul>
//                             </div>
//                         </div>
//                     </TabsContent>
//                 ))}
//             </Tabs>
//
//             {/* Activity Dialog */}
//             <Dialog open={open} onOpenChange={setOpen}>
//                 <DialogContent className="sm:max-w-[600px] bg-gray-50">
//                     {selectedPhoneme && (
//                         <>
//                             <DialogHeader>
//                                 <div className="text-center">
//                                     <div
//                                         className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 animate-pulse"
//                                         style={{ backgroundColor: selectedPhoneme.color }}
//                                     >
//                                         <span className="text-4xl">{selectedPhoneme.icon}</span>
//                                     </div>
//                                     <DialogTitle className="text-3xl mb-2" style={{ color: selectedPhoneme.color }}>
//                                         Som "{selectedPhoneme.sound}"
//                                     </DialogTitle>
//                                     <DialogDescription className="text-xl">
//                                         {selectedPhoneme.word}
//                                     </DialogDescription>
//                                 </div>
//                             </DialogHeader>
//
//                             <div className="space-y-4">
//                                 <Card className="p-4">
//                                     <p className="text-lg mb-2">{selectedPhoneme.funFact}</p>
//                                     <p
//                                         className="text-2xl font-bold text-center animate-bounce"
//                                         style={{ color: selectedPhoneme.color }}
//                                     >
//                                         {selectedPhoneme.funWord}
//                                     </p>
//                                 </Card>
//
//                                 <Card className="p-4">
//                                     <h4 className="font-bold mb-2">Como Fazer:</h4>
//                                     <p className="text-lg mb-2">{selectedPhoneme.practiceWord}</p>
//                                     <p className="text-sm text-gray-600">{selectedPhoneme.soundTip}</p>
//                                     <Badge
//                                         variant="outline"
//                                         className="mt-2"
//                                         style={{ color: selectedPhoneme.color, borderColor: selectedPhoneme.color }}
//                                     >
//                                         Nível: {selectedPhoneme.level}
//                                     </Badge>
//                                 </Card>
//
//                                 {/* Speech Exercise Activities */}
//                                 <Card className="p-4">
//                                     <h4 className="font-bold mb-4 text-lg flex items-center gap-2">
//                                         <span className="text-2xl">🎯</span>
//                                         Exercícios do Som "{selectedPhoneme.sound}"
//                                     </h4>
//
//                                     <div className="grid gap-4">
//                                         {/* Repetition Exercises */}
//                                         <div className="relative overflow-hidden rounded-lg border bg-gradient-to-b from-white to-gray-50 p-4">
//                                             <div className="mb-3 flex items-center gap-2">
//                                                 <span className="text-2xl">🔁</span>
//                                                 <h5 className="font-semibold text-lg">Repetição</h5>
//                                             </div>
//                                             <div className="space-y-2">
//                                                 <div className="flex items-center gap-2 p-2 hover:bg-white rounded-lg">
//                                                     <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedPhoneme.color }} />
//                                                     <span>Repita: {selectedPhoneme.sound} - {selectedPhoneme.sound} - {selectedPhoneme.sound}</span>
//                                                 </div>
//                                                 <div className="flex items-center gap-2 p-2 hover:bg-white rounded-lg">
//                                                     <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedPhoneme.color }} />
//                                                     <span>Fale devagar: {selectedPhoneme.practiceWord}</span>
//                                                 </div>
//                                                 <div className="flex items-center gap-2 p-2 hover:bg-white rounded-lg">
//                                                     <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedPhoneme.color }} />
//                                                     <span>Repita mais rápido!</span>
//                                                 </div>
//                                             </div>
//                                         </div>
//
//                                         {/* Mirror Practice */}
//                                         <div className="relative overflow-hidden rounded-lg border bg-gradient-to-b from-white to-gray-50 p-4">
//                                             <div className="mb-3 flex items-center gap-2">
//                                                 <span className="text-2xl">🪞</span>
//                                                 <h5 className="font-semibold text-lg">Prática no Espelho</h5>
//                                             </div>
//                                             <div className="space-y-2">
//                                                 <div className="flex items-center gap-2 p-2 hover:bg-white rounded-lg">
//                                                     <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedPhoneme.color }} />
//                                                     <span>Observe sua boca no espelho</span>
//                                                 </div>
//                                                 <div className="flex items-center gap-2 p-2 hover:bg-white rounded-lg">
//                                                     <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedPhoneme.color }} />
//                                                     <span>Imite o formato da boca corretamente</span>
//                                                 </div>
//                                                 <div className="flex items-center gap-2 p-2 hover:bg-white rounded-lg">
//                                                     <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedPhoneme.color }} />
//                                                     <span>Practice o som olhando no espelho</span>
//                                                 </div>
//                                             </div>
//                                         </div>
//
//                                         {/* Fun Activities */}
//                                         <div className="relative overflow-hidden rounded-lg border bg-gradient-to-b from-white to-gray-50 p-4">
//                                             <div className="mb-3 flex items-center gap-2">
//                                                 <span className="text-2xl">🎮</span>
//                                                 <h5 className="font-semibold text-lg">Brincadeiras</h5>
//                                             </div>
//                                             <div className="space-y-2">
//                                                 <div className="flex items-center gap-2 p-2 hover:bg-white rounded-lg">
//                                                     <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedPhoneme.color }} />
//                                                     <span>Encontre objetos com o som {selectedPhoneme.sound}</span>
//                                                 </div>
//                                                 <div className="flex items-center gap-2 p-2 hover:bg-white rounded-lg">
//                                                     <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedPhoneme.color }} />
//                                                     <span>Desenhe coisas que começam com {selectedPhoneme.sound}</span>
//                                                 </div>
//                                                 <div className="flex items-center gap-2 p-2 hover:bg-white rounded-lg">
//                                                     <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedPhoneme.color }} />
//                                                     <span>Cante músicas usando o som</span>
//                                                 </div>
//                                             </div>
//                                         </div>
//
//                                         {/* Recording Practice */}
//                                         <div className="relative overflow-hidden rounded-lg border bg-gradient-to-b from-white to-gray-50 p-4">
//                                             <div className="mb-3 flex items-center gap-2">
//                                                 <span className="text-2xl">🎥</span>
//                                                 <h5 className="font-semibold text-lg">Gravação</h5>
//                                             </div>
//                                             <div className="space-y-2">
//                                                 <div className="flex items-center gap-2 p-2 hover:bg-white rounded-lg">
//                                                     <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedPhoneme.color }} />
//                                                     <span>Grave você falando o som</span>
//                                                 </div>
//                                                 <div className="flex items-center gap-2 p-2 hover:bg-white rounded-lg">
//                                                     <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedPhoneme.color }} />
//                                                     <span>Ouça e compare com o modelo</span>
//                                                 </div>
//                                                 <div className="flex items-center gap-2 p-2 hover:bg-white rounded-lg">
//                                                     <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedPhoneme.color }} />
//                                                     <span>Tente melhorar cada vez mais!</span>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//
//                                     {/* Progress Section */}
//                                     <div className="mt-6 p-4 bg-gray-50 rounded-lg">
//                                         <h5 className="font-semibold mb-3 flex items-center gap-2">
//                                             <span>📈</span>
//                                             Seu Progresso com o Som {selectedPhoneme.sound}
//                                         </h5>
//                                         <div className="space-y-2">
//                                             <div className="flex justify-between text-sm">
//                                                 <span>Exercícios Completados</span>
//                                                 <span className="font-semibold">0/12</span>
//                                             </div>
//                                             <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
//                                                 <div
//                                                     className="h-full transition-all duration-500"
//                                                     style={{
//                                                         width: '0%',
//                                                         backgroundColor: selectedPhoneme.color
//                                                     }}
//                                                 />
//                                             </div>
//                                         </div>
//                                     </div>
//
//                                     {/* Tip Section */}
//                                     <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
//                                         <div className="flex gap-2 items-start">
//                                             <span className="text-xl">💡</span>
//                                             <p className="text-sm text-blue-800">
//                                                 Dica: Pratique cada exercício por 2-3 minutos.
//                                                 Se ficar cansado, faça uma pausa! A prática regular
//                                                 é mais importante que a duração.
//                                             </p>
//                                         </div>
//                                     </div>
//                                 </Card>
//                             </div>
//                         </>
//                     )}
//                 </DialogContent>
//             </Dialog>
//         </div>
//     );
// };
//
// export default SpeechRemote;
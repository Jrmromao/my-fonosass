// // import React from 'react';
// // import {Dialog, DialogContent, DialogTitle} from '@/components/ui/dialog';
// // import {AppleProps, Letter} from './types';
// // import PhonemeCard from "@/components/tree/PhonemeCard";
// //
// // // Apple Component with fixed position inside leaf cluster
// // const Apple: React.FC<AppleProps> = ({ letter, onClick, isSelected }) => {
// //     return (
// //         <g
// //             onClick={() => onClick(letter)}
// //             className="cursor-pointer transition-transform hover:scale-105"
// //             style={{ transform: `translate(${letter.position.x}px, ${letter.position.y}px)` }}
// //         >
// //             <circle
// //                 r="18"
// //                 fill={letter.color}
// //                 className={`transition-all duration-300 ${
// //                     isSelected ? 'filter brightness-110' : ''
// //                 }`}
// //                 style={{
// //                     filter: 'drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.1))'
// //                 }}
// //             />
// //             <text
// //                 textAnchor="middle"
// //                 dy="6"
// //                 fontSize="16"
// //                 className="fill-gray-800 font-bold select-none"
// //             >
// //                 {letter.char}
// //             </text>
// //         </g>
// //     );
// // };
// //
// // // Tree Branch Component
// // // const TreeBranch: React.FC<TreeBranchProps> = ({
// // //                                                    startX,
// // //                                                    startY,
// // //                                                    endX,
// // //                                                    endY,
// // //                                                    thickness = 10
// // //                                                }) => {
// // //     return (
// // //         <path
// // //             d={`M ${startX} ${startY} Q ${(startX + endX) / 2} ${
// // //                 (startY + endY) / 2 - 20
// // //             } ${endX} ${endY}`}
// // //             stroke="#475569"
// // //             strokeWidth={thickness}
// // //             fill="none"
// // //             strokeLinecap="round"
// // //         />
// // //     );
// // // };
// //
// // // Leaf Cluster Component
// // // const LeafCluster: React.FC<{
// // //     x: number;
// // //     y: number;
// // //     rotation?: number;
// // //     scale?: number;
// // // }> = ({ x, y, rotation = 0, scale = 1 }) => {
// // //     return (
// // //         <g transform={`translate(${x}, ${y}) rotate(${rotation}) scale(${scale})`}>
// // //             <path
// // //                 d="M0,0 C-50,-30 -50,-90 0,-100 C50,-90 50,-30 0,0"
// // //                 fill="#4ADE80"
// // //                 className="animate-sway"
// // //             />
// // //             <path
// // //                 d="M0,-20 C-30,-40 -30,-80 0,-90 C30,-80 30,-40 0,-20"
// // //                 fill="#86EFAC"
// // //                 className="animate-sway-delay"
// // //             />
// // //         </g>
// // //     );
// // // };
// //
// // // Main Tree Component
// // const AlphabetTree: React.FC<{
// //     selectedLetter: Letter | null;
// //     onLetterSelect: (letter: Letter) => void;
// // }> = ({
// //           selectedLetter,
// //           onLetterSelect
// //       }) => {
// //     return (
// //         <svg viewBox="0 0 800 600" className="w-full h-full">
// //             {/* Tree Structure */}
// //             <g>
// //                 {/* Main Trunk */}
// //                 <rect
// //                     x="385"
// //                     y="250"
// //                     width="30"
// //                     height="150"
// //                     fill="#475569"
// //                     rx="2"
// //                 />
// //
// //                 {/* Branch Base */}
// //                 <path
// //                     d="M300,250 L500,250 C450,220 350,220 300,250"
// //                     fill="#475569"
// //                 />
// //
// //                 {/* Left Branch */}
// //                 <path
// //                     d="M300,250 C250,230 200,240 180,260"
// //                     stroke="#475569"
// //                     strokeWidth="40"
// //                     strokeLinecap="round"
// //                     fill="none"
// //                 />
// //
// //                 {/* Right Branch */}
// //                 <path
// //                     d="M500,250 C550,230 600,240 620,260"
// //                     stroke="#475569"
// //                     strokeWidth="40"
// //                     strokeLinecap="round"
// //                     fill="none"
// //                 />
// //             </g>
// //
// //             {/* Leaf Clusters */}
// //             <g className="leaf-clusters">
// //                 {/* Left Cluster */}
// //                 <path
// //                     d="M150,200 C150,150 300,150 300,200 C300,250 150,250 150,200"
// //                     fill="#4ADE80"
// //                     className="animate-sway"
// //                 />
// //
// //                 {/* Center Cluster */}
// //                 <path
// //                     d="M350,150 C350,100 450,100 450,150 C450,200 350,200 350,150"
// //                     fill="#4ADE80"
// //                     className="animate-sway-delay"
// //                 />
// //
// //                 {/* Right Cluster */}
// //                 <path
// //                     d="M500,200 C500,150 650,150 650,200 C650,250 500,250 500,200"
// //                     fill="#4ADE80"
// //                     className="animate-sway"
// //                 />
// //             </g>
// //
// //             {/* Letters */}
// //             {alphabetData.map((letter) => (
// //                 <Apple
// //                     key={letter.char}
// //                     letter={letter}
// //                     onClick={onLetterSelect}
// //                     isSelected={selectedLetter?.char === letter.char}
// //                 />
// //             ))}
// //         </svg>
// //     );
// // };
// //
// // // Positioning of letters in clusters
// // // Updated letter positions to match the image
// // const alphabetData: Letter[] = [
// //     // Left cluster
// //     { char: 'A', position: { x: 250, y: 240 }, color: '#FF6B6B', phonemes: [] },
// //     { char: 'B', position: { x: 290, y: 120 }, color: '#87CEEB', phonemes: [] },
// //     { char: 'C', position: { x: 240, y: 170 }, color: '#FFD700', phonemes: [] },
// //     { char: 'D', position: { x: 280, y: 150 }, color: '#FF9A9E', phonemes: [] },
// //     { char: 'E', position: { x: 260, y: 190 }, color: '#98FB98', phonemes: [] },
// //
// //     // Center cluster
// //     { char: 'F', position: { x: 370, y: 120 }, color: '#FF9A9E', phonemes: [] },
// //     { char: 'G', position: { x: 410, y: 120 }, color: '#87CEEB', phonemes: [] },
// //     { char: 'H', position: { x: 390, y: 140 }, color: '#DDA0DD', phonemes: [] },
// //     { char: 'I', position: { x: 370, y: 160 }, color: '#98FB98', phonemes: [] },
// //     { char: 'J', position: { x: 410, y: 160 }, color: '#E6E6FA', phonemes: [] },
// //
// //     // Right cluster
// //     { char: 'K', position: { x: 510, y: 140 }, color: '#FFD700', phonemes: [] },
// //     { char: 'L', position: { x: 550, y: 120 }, color: '#FF9A9E', phonemes: [] },
// //     { char: 'M', position: { x: 500, y: 170 }, color: '#FFD700', phonemes: [] },
// //     { char: 'N', position: { x: 540, y: 150 }, color: '#FF9A9E', phonemes: [] },
// //     { char: 'O', position: { x: 520, y: 190 }, color: '#98FB98', phonemes: [] },
// // ];
// //
// //
// //
// // // Main Component
// // export const PhonemeTree: React.FC = () => {
// //     const [selectedLetter, setSelectedLetter] = React.useState<Letter | null>(null);
// //
// //
// //
// //     return (
// //         <div className="w-full max-w-4xl mx-auto p-4">
// //             <div className="relative aspect-[4/3]">
// //                 <AlphabetTree
// //                     selectedLetter={selectedLetter}
// //                     onLetterSelect={setSelectedLetter}
// //                 />
// //             </div>
// //
// //
// //             <Dialog open={!!selectedLetter} onOpenChange={() => setSelectedLetter(null)}>
// //                 <DialogTitle>Detalhes da Letra</DialogTitle>
// //                 <DialogContent>
// //                     {selectedLetter && (
// //                         <div className="space-y-4">
// //                             <h2 className="text-3xl font-bold text-center">
// //                                 Letra {selectedLetter.char}
// //                             </h2>
// //
// //                             {selectedLetter.phonemes.map((phoneme, index) => (
// //                                 <PhonemeCard
// //                                     key={index}
// //                                     phoneme={phoneme}
// //                                     onClose={() => setSelectedLetter(null)}
// //                                 />
// //                             ))}
// //                         </div>
// //                     )}
// //                 </DialogContent>
// //             </Dialog>
// //         </div>
// //     );
// // };
// //
// // export default PhonemeTree;
//
//
//
// import React, { useState } from 'react';
// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
// } from "@/components/ui/dialog";
//
// // Apple data structure with positions and messages
// const generateApples = (count: number) => {
//     // Define the bounds for apple placement
//     const bounds = {
//         minX: 980,
//         maxX: 750,
//         minY: 880,
//         maxY: 250
//     };
//
//     return Array.from({ length: count }, (_, index) => ({
//         id: index + 1,
//         x: bounds.minX + (Math.random() * (bounds.maxX - bounds.minX)),
//         y: bounds.minY + (Math.random() * (bounds.maxY - bounds.minY)),
//         color: Math.random() > 0.5 ? '#D81E1E' : '#C41E1E',
//         message: `Message for Apple #${index + 1}`,
//         title: `Apple #${index + 1}`
//     }));
// };
//
// const Apple = ({ apple, onClick }) => {
//     return (
//         <g onClick={onClick} style={{ cursor: 'pointer' }}>
//             <circle
//                 cx={apple.x}
//                 cy={apple.y}
//                 r="20"
//                 fill={apple.color}
//                 className="hover:opacity-90 transition-opacity"
//             />
//             <circle
//                 cx={apple.x + 2}
//                 cy={apple.y - 3}
//                 r="6"
//                 fill="#FFFFFF"
//                 opacity="0.4"
//             />
//         </g>
//     );
// };
//
// const PhonemeTree = ({ numberOfApples = 10 }) => {
//     const [apples] = useState(() => generateApples(numberOfApples));
//     const [selectedApple, setSelectedApple] = useState(null);
//
//     return (
//         <div className="w-full max-w-4xl mx-auto">
//             <Dialog>
//                 <svg
//                     version="1.1"
//                     viewBox="0 0 1600 1600"
//                     className="w-full h-auto"
//                     xmlns="http://www.w3.org/2000/svg"
//                 >
//                     {/* Background */}
//                     <path transform="translate(0)" d="m0 0h1600v1600h-1600z" fill="#FCFCFC"/>
//
//                     {/* Tree trunk and base structure */}
//                     <path
//                         d="m0 0h26l15 3 17 8 11 8 2 4 3 1 4 5 4-1 9-5 8-2h18l9 3 12 6 7 6 3 4h8l9-1 10 6 6 5v2l4-2 3-5 8-11 8-9 15-11 17-8 15-4 16-2h9l19 3 21 8 1 3 5 2 2 1v2l4 1 1 3 4 2 9 9 2 1 2-4h2l1-3 13-10 14-8 15-5 16-3h27l22 5 11 5 19 10 15 14 8 9 8 13 7 17 4 19v20l-4 17v3l12 4v2l4 1 11 11 4 12 1 5v13l-2 8-2 5v3l9 6 7 8 5 10 2 8v18l-2 10-8 16-9 11-3 3 19 1 14 3 15 6 11 7v2l5 2 2 4 4 2 7 9 8 14 4 10 3 14 1 8v9l-2 14-4 11-8 15h11l17 4 8 4 7 3 10 7 11 10 5 6v2h2l10 21 4 17v21l-3 16-6 15-4 6-2 5-6 7h-2l-2 4-5 4-1 2h-2v3l5 1 7 3 13 12 3 4v2h2l6 16 1 5v18l-2 9 11-1 5 2-1 5-4 6-10 4-10 1v4h2l1 4 4 1 11 18 3 7 4 14 1 6v23l-4 16-6 14-4 7h-2l-2 4-4 6h-2v2h-2l-1 3-5 4h-2l-2 4-4 3h-3v2l-9 4-12 5-14 3h-23l-2 17-4 12-8 15-2 3h-2l-2 4-11 11-16 10-15 6-15 3-6 1h-11l-19-3-16-6-8-4-2 6-11 16h-2l-2 4-5 4h-2v2l-11 7-10 5-13 5-13 3h-25l-18-4-14-6-12-8-4-2-5-5-9-10h-11l-4-5v-11l-2-1h-10v2l-11 8-5 5h-2v2l-2 1-2 4-8 7-4 5h-2l-1 3h-2l-2 4-9 14-3 7h-2l-3 11-3 6-5 20v26l1 28 4 53 5 54 3 25 4 29 3 16 8 26 8 20 6 11 2 1 3 6 11 12 7 7 2 1v2h3l4 4 18 11 13 5-6-12-2-5h-2v-3l9 3 8 5 3 1v2l5 2 2 1-2-8-1-14h3l8 15 5 3 3 5v2l5-2 2-3v-12h2l4-40 1-2h3l4 11 2 10 4 2 5 6 4 13v2l4-4 6-10 8-9 3-2h3l-2 5-13 26-3 11 6-2 2-11 3-9 4 2 3 14h2l4-5 7-9 9-10 4 1 8-7 1-2 5-2 8-5 8-4h4l-2 4-9 9-8 10-6 7-3 5-9 14-2 4 1 4 6-4 6-8h2v-2l4 1 3 6 15-7 3-1h7l-2 4-1 4 13-1 2 1v4l-7 4-5 5h-2l1 3h10l-2 9 13 1 15 2-7-16-5-9-2-3v-4l6 2v2l3 1v2l5 2 6 7 2 1v2h2l5 5 3-8 1-20h4l5 12 2 7 4-4 7-14 4-2 1 2v25l3 1v-2l9-6 3 1-2 9-4 8 8-7 5-5h2v-2l13-8 9-3-1 5-10 9-11 11-3 4v3l9 1 4-4 6 1 2-3 8 1 5-2h7l-2 4-3 1-2 6 23 2 58 7 70 11 14 2 3 1v2l5 1v3l-10 1-29 1h-265l-97-1h-43l-50 3-13 1h-37l-16-1h-55l-37 1h-186l-25-1-12-1h-51l-47 2h-191l-41-1-22-1-40-1-7-1v-3l19-5 26-4 13-3 36-6 47-5h4l-1-2-5-3-4-3v-2h9l17 3 8 3 7 1v-4h-2l-8-10 2-2 12 6 7 2-1-4h-2l-1-4h-2l-4-6-5-6v-3h-2v-3h-2l-1-4 4 1 10 6 6 3 5 6 5 4 3 1 3 5v-10h4v2l6 2 4 4 4 1-1-6-6-10-2-1-1-4-3-3-1-4h-2l-1-3 5 1 5 2v2l5 2 4 3v2l4 2 5 4 5 3 1-1-1-7h-2l-1-11 4 1 3 5 6 7 4 6 2-4 6-15 8-14 3-2 1 1-2 28-1 4h2l2-5 8-13 3-3 4 2v2h3l-1 5-3 6-1 5 3 6v3h12l-2-3v-5l2-2h6l-3-7-3-6 4-1 11 6h2l-1-8-1-7h4l7 6 3 6v2h2l-2-7-1-6 8 1 8 5 3 1-5-8-1-5h-2l-6-12-14-20-1-4 6 1 19 19 2 1 4 7 7 10v-18h4l8 12 1 3h3v-2l7 1 6 7h2l2-4 3 1 3 6v3h3l-5-25-4-17-4-11v-3l4 1 11 14 5 9 3 1 2-11 4-9h3l2 6 3 15 4 22 1 10 4-5 8-16 5-9 4 1 2 7 3-3 3-4h6l5 3 2-4 6-7 3 1 2 7h7l3-3h3l2 7 4-1 14-13 9-14 9-17 5-13 7-24 6-30 6-46 1-14 2-77v-82l-1-22-3-15-4-10-6-10-8-11-14-15-7-6-3 6-4 3h-9l-2-1-4 8h-2l-1 4-3 4h-2l-2 4-5 5-6 5-18 10-11 4-16 3h-18l-20-4-21-9v-2l-5-2-7-4-7-8-9-10-6-10-4-9-4-10-5 2-19 9-11 4-12 1h-13l-15-2-16-6-11-5v-2l-4-2-9-7-9-10-7-10-3-6-12-4-9-7-6-9-5-10-2-11v-11l3-12 7-15h2v-3h-3l-2 4-7 1-4-4-5 1h-14l-1-1v-5l7-6h2l-5-5-6-5v-2l-4-2-13-13-6-11-5-11-4-14-1-6v-17l2-13 6-17 6-11 11-12-1-5-9-9-7-12-6-19v-22l4-14 6-12 9-11 7-7h2l-1-9 3-2 10-1-6-12-1-9 3-8 3-7-6-2-10-6-3-1-5-5-11-12-9-15-4-8-4-16-2-14v-12l3-17 7-19 9-15 12-13 10-8 10-6 11-5 14-4 14-1-3-16v-16l4-18 7-16 6-9 6-8 11-11 14-9 10-5 17-5 6-1h27l19 4 2 1-3-9-1-6v-15l3-13 7-14 11-13 13-9 13-5 4-1h19l11 2 3-12 8-16 10-13 3-3h2l2-4 18-12 11-5z"
//                         transform="translate(614,103)"
//                         fill="#240F01"
//                     />
//
//                     {/* Dynamic Apples */}
//                     {apples.map((apple) => (
//                         <DialogTrigger key={apple.id} asChild>
//                             <Apple apple={apple} onClick={() => setSelectedApple(apple)} />
//                         </DialogTrigger>
//                     ))}
//                 </svg>
//
//                 {selectedApple && (
//                     <DialogContent>
//                         <DialogHeader>
//                             <DialogTitle>{selectedApple.title}</DialogTitle>
//                             <DialogDescription>
//                                 {selectedApple.message}
//                             </DialogDescription>
//                         </DialogHeader>
//                     </DialogContent>
//                 )}
//             </Dialog>
//         </div>
//     );
// };
//
//

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Position {
  x: number;
  y: number;
}

interface Apple {
  id: string;
  position: Position;
  message: string;
  size: number;
}

interface TreeProps {
  messages?: string[];
  onAppleClick?: (apple: Apple) => void;
  className?: string;
}

const createApplePositions = (): Apple[] => {
  const basePositions = [
    // Left cluster
    { x: 180, y: 220 },
    { x: 160, y: 280 },
    { x: 200, y: 320 },
    { x: 240, y: 260 },
    // Center top cluster
    { x: 300, y: 180 },
    { x: 340, y: 150 },
    { x: 380, y: 160 },
    // Right cluster
    { x: 420, y: 220 },
    { x: 460, y: 280 },
    { x: 440, y: 320 },
    // Bottom cluster
    { x: 280, y: 380 },
    { x: 320, y: 420 },
    { x: 360, y: 400 },
    // Scattered apples
    { x: 240, y: 340 },
    { x: 400, y: 360 },
  ].map((pos, index) => ({
    id: `apple-${index}`,
    position: {
      x: pos.x + (Math.random() * 10 - 5),
      y: pos.y + (Math.random() * 10 - 5),
    },
    message: `Apple ${index + 1}`,
    size: 12 + Math.random() * 4,
  }));

  return basePositions;
};

const PhonemeTree: React.FC<TreeProps> = ({
  messages = [],
  onAppleClick,
  className = '',
}) => {
  const [selectedApple, setSelectedApple] = useState<Apple | null>(null);
  const [apples] = useState<Apple[]>(() => {
    const positions = createApplePositions();
    return positions.map((apple, index) => ({
      ...apple,
      message: messages[index] || apple.message,
    }));
  });

  const handleAppleClick = (apple: Apple): void => {
    setSelectedApple(apple);
    if (onAppleClick) {
      onAppleClick(apple);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Dialog>
        <svg
          viewBox="0 0 600 600"
          className="w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Enhanced gradients */}
            <radialGradient id="leafGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2D5A27" />
              <stop offset="40%" stopColor="#1B4121" />
              <stop offset="100%" stopColor="#0F2816" />
            </radialGradient>

            <linearGradient
              id="trunkGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#4A2F1D" />
              <stop offset="50%" stopColor="#6B4423" />
              <stop offset="100%" stopColor="#4A2F1D" />
            </linearGradient>

            {/* Shadow */}
            <radialGradient id="shadowGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(0,0,0,0.2)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          </defs>

          {/* Ground shadow */}
          <ellipse
            cx="300"
            cy="580"
            rx="200"
            ry="20"
            fill="url(#shadowGradient)"
          />

          {/* Tree trunk */}
          <path
            d="M280 570
               C280 570 260 400 260 400
               C260 380 340 380 340 400
               C340 400 320 570 320 570
               Z"
            fill="url(#trunkGradient)"
          />

          {/* Tree foliage */}
          <path
            d="M300 100
               C200 100 100 200 100 300
               C100 400 200 500 300 500
               C400 500 500 400 500 300
               C500 200 400 100 300 100"
            fill="url(#leafGradient)"
          />

          {/* Interactive apples */}
          {apples.map((apple) => (
            <DialogTrigger key={apple.id} asChild>
              <g
                onClick={() => handleAppleClick(apple)}
                className="cursor-pointer transform transition-all duration-200 hover:scale-110"
                role="button"
                aria-label={`Apple with message: ${apple.message}`}
              >
                {/* Apple body */}
                <circle
                  cx={apple.position.x}
                  cy={apple.position.y}
                  r={apple.size}
                  fill="#E41E31"
                  className="transition-colors hover:fill-current hover:text-red-600"
                />
                {/* Highlight */}
                <circle
                  cx={apple.position.x - apple.size / 3}
                  cy={apple.position.y - apple.size / 3}
                  r={apple.size / 4}
                  fill="rgba(255,255,255,0.3)"
                />
                {/* Stem */}
                <path
                  d={`M${apple.position.x} ${apple.position.y - apple.size}
                     C${apple.position.x} ${apple.position.y - apple.size - 2}
                     ${apple.position.x + 2} ${apple.position.y - apple.size - 4}
                     ${apple.position.x + 3} ${apple.position.y - apple.size - 3}`}
                  stroke="#634B3F"
                  strokeWidth="1.5"
                  fill="none"
                />
              </g>
            </DialogTrigger>
          ))}
        </svg>

        {/* Dialog for apple messages */}
        {selectedApple && (
          <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-green-800">
                🍎 Apple Message
              </DialogTitle>
              <DialogDescription className="text-lg mt-4 text-gray-700">
                {selectedApple.message}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default PhonemeTree;

// import React, { useState } from 'react';
// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
// } from "@/components/ui/dialog";
//
// interface Position {
//     x: number;
//     y: number;
// }
//
// interface Apple {
//     id: string;
//     position: Position;
//     message: string;
// }
//
// interface TreeProps {
//     messages?: string[];
//     onAppleClick?: (apple: Apple) => void;
//     className?: string;
// }
//
// const NaturalAppleTree: React.FC<TreeProps> = ({
//                                                    messages = [],
//                                                    onAppleClick,
//                                                    className = ''
//                                                }) => {
//     const [selectedApple, setSelectedApple] = useState<Apple | null>(null);
//
//     // Predefined apple positions for natural distribution
//     const applePositions: Apple[] = [
//         // Left side branch
//         { id: 'apple-1', position: { x: 180, y: 280 }, message: 'Apple 1' },
//         { id: 'apple-2', position: { x: 220, y: 260 }, message: 'Apple 2' },
//         { id: 'apple-3', position: { x: 200, y: 320 }, message: 'Apple 3' },
//
//         // Right side branch
//         { id: 'apple-4', position: { x: 420, y: 280 }, message: 'Apple 4' },
//         { id: 'apple-5', position: { x: 380, y: 260 }, message: 'Apple 5' },
//         { id: 'apple-6', position: { x: 400, y: 320 }, message: 'Apple 6' },
//
//         // Top branches
//         { id: 'apple-7', position: { x: 280, y: 180 }, message: 'Apple 7' },
//         { id: 'apple-8', position: { x: 320, y: 160 }, message: 'Apple 8' },
//
//         // Central area
//         { id: 'apple-9', position: { x: 300, y: 250 }, message: 'Apple 9' },
//         { id: 'apple-10', position: { x: 340, y: 280 }, message: 'Apple 10' },
//
//         // Lower branches
//         { id: 'apple-11', position: { x: 260, y: 380 }, message: 'Apple 11' },
//         { id: 'apple-12', position: { x: 340, y: 380 }, message: 'Apple 12' },
//     ].map((apple, index) => ({
//         ...apple,
//         message: messages[index] || apple.message
//     }));
//
//     return (
//         <div className={`relative ${className}`}>
//             <Dialog>
//                 <svg viewBox="0 0 600 600" className="w-full h-auto">
//                     <defs>
//                         {/* Tree gradients */}
//                         <radialGradient id="leafGradient" cx="50%" cy="50%" r="50%">
//                             <stop offset="0%" stopColor="#2D5A27"/>
//                             <stop offset="40%" stopColor="#1B4121"/>
//                             <stop offset="100%" stopColor="#0F2816"/>
//                         </radialGradient>
//
//                         <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
//                             <stop offset="0%" stopColor="#5C4033"/>
//                             <stop offset="50%" stopColor="#8B4513"/>
//                             <stop offset="100%" stopColor="#5C4033"/>
//                         </linearGradient>
//
//                         {/* Shadow gradient */}
//                         <radialGradient id="shadowGradient" cx="50%" cy="50%" r="50%">
//                             <stop offset="0%" stopColor="rgba(0,0,0,0.15)"/>
//                             <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
//                         </radialGradient>
//                     </defs>
//
//                     {/* Tree shadow */}
//                     <ellipse
//                         cx="300"
//                         cy="580"
//                         rx="150"
//                         ry="15"
//                         fill="url(#shadowGradient)"
//                     />
//
//                     {/* Tree trunk */}
//                     <path
//                         d="M280 570
//                C280 570 260 400 260 400
//                C260 380 340 380 340 400
//                C340 400 320 570 320 570
//                Z"
//                         fill="url(#trunkGradient)"
//                     />
//
//                     {/* Main branches */}
//                     <path
//                         d="M300 400
//                L200 300
//                L150 250
//                C140 240 160 220 170 230
//                L220 270"
//                         stroke="url(#trunkGradient)"
//                         strokeWidth="20"
//                         strokeLinecap="round"
//                     />
//
//                     <path
//                         d="M300 400
//                L400 300
//                L450 250
//                C460 240 440 220 430 230
//                L380 270"
//                         stroke="url(#trunkGradient)"
//                         strokeWidth="20"
//                         strokeLinecap="round"
//                     />
//
//                     {/* Main foliage */}
//                     <path
//                         d="M300 100
//                C180 100 80 200 100 300
//                C120 400 200 450 300 450
//                C400 450 480 400 500 300
//                C520 200 420 100 300 100
//
//                M300 120
//                C200 120 120 200 140 300
//                C160 400 220 430 300 430
//                C380 430 440 400 460 300
//                C480 200 400 120 300 120"
//                         fill="url(#leafGradient)"
//                     />
//
//                     {/* Interactive apples */}
//                     {applePositions.map((apple) => (
//                         <DialogTrigger key={apple.id} asChild>
//                             <g
//                                 onClick={() => {
//                                     setSelectedApple(apple);
//                                     if (onAppleClick) onAppleClick(apple);
//                                 }}
//                                 className="cursor-pointer transition-transform"
//                                 role="button"
//                                 aria-label={`Apple with message: ${apple.message}`}
//                             >
//                                 {/* Apple body */}
//                                 <circle
//                                     cx={apple.position.x}
//                                     cy={apple.position.y}
//                                     r="12"
//                                     fill="#E41E31"
//                                     className="transition-colors hover:fill-current hover:text-red-600"
//                                 />
//                                 {/* Apple highlight */}
//                                 <circle
//                                     cx={apple.position.x - 4}
//                                     cy={apple.position.y - 4}
//                                     r="3"
//                                     fill="rgba(255,255,255,0.3)"
//                                 />
//                                 {/* Apple stem */}
//                                 <path
//                                     d={`M${apple.position.x} ${apple.position.y - 12}
//                      C${apple.position.x} ${apple.position.y - 14}
//                      ${apple.position.x + 2} ${apple.position.y - 16}
//                      ${apple.position.x + 3} ${apple.position.y - 15}`}
//                                     stroke="#634B3F"
//                                     strokeWidth="1.5"
//                                     fill="none"
//                                 />
//                                 {/* Small leaf */}
//                                 <path
//                                     d={`M${apple.position.x + 3} ${apple.position.y - 15}
//                      C${apple.position.x + 5} ${apple.position.y - 17}
//                      ${apple.position.x + 8} ${apple.position.y - 16}
//                      ${apple.position.x + 6} ${apple.position.y - 14}`}
//                                     fill="#2D5A27"
//                                 />
//                             </g>
//                         </DialogTrigger>
//                     ))}
//                 </svg>
//
//                 {selectedApple && (
//                     <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur">
//                         <DialogHeader>
//                             <DialogTitle className="text-xl font-semibold text-green-800">
//                                 🍎 Apple Message
//                             </DialogTitle>
//                             <DialogDescription className="text-lg mt-4 text-gray-700">
//                                 {selectedApple.message}
//                             </DialogDescription>
//                         </DialogHeader>
//                     </DialogContent>
//                 )}
//             </Dialog>
//         </div>
//     );
// };
//
// export default NaturalAppleTree;
//
//
// import React, { useState } from 'react';
// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
// } from "@/components/ui/dialog";
//
// interface Position {
//     x: number;
//     y: number;
// }
//
// interface Apple {
//     id: string;
//     position: Position;
//     message: string;
// }
//
// interface TreeProps {
//     messages?: string[];
//     onAppleClick?: (apple: Apple) => void;
//     className?: string;
// }
//
// const OutlinedTree: React.FC<TreeProps> = ({
//                                                messages = [],
//                                                onAppleClick,
//                                                className = ''
//                                            }) => {
//     const [selectedApple, setSelectedApple] = useState<Apple | null>(null);
//
//     const applePositions: Apple[] = [
//         // Top three
//         { id: '1', position: { x: 240, y: 120 }, message: 'Apple 1' },
//         { id: '2', position: { x: 300, y: 120 }, message: 'Apple 2' },
//         { id: '3', position: { x: 360, y: 120 }, message: 'Apple 3' },
//
//         // Second row
//         { id: '4', position: { x: 200, y: 180 }, message: 'Apple 4' },
//         { id: '5', position: { x: 280, y: 180 }, message: 'Apple 5' },
//         { id: '6', position: { x: 400, y: 180 }, message: 'Apple 6' },
//
//         // Third row
//         { id: '7', position: { x: 180, y: 240 }, message: 'Apple 7' },
//         { id: '8', position: { x: 300, y: 240 }, message: 'Apple 8' },
//         { id: '9', position: { x: 420, y: 240 }, message: 'Apple 9' },
//
//         // Fourth row
//         { id: '10', position: { x: 200, y: 300 }, message: 'Apple 10' },
//         { id: '11', position: { x: 320, y: 300 }, message: 'Apple 11' },
//         { id: '12', position: { x: 400, y: 300 }, message: 'Apple 12' },
//
//         // Bottom three
//         { id: '13', position: { x: 240, y: 360 }, message: 'Apple 13' },
//         { id: '14', position: { x: 300, y: 360 }, message: 'Apple 14' },
//         { id: '15', position: { x: 360, y: 360 }, message: 'Apple 15' },
//     ].map((apple, index) => ({
//         ...apple,
//         message: messages[index] || apple.message
//     }));
//
//     return (
//         <div className={`relative ${className}`}>
//             <Dialog>
//                 <svg viewBox="0 0 600 600" className="w-full h-auto" style={{ background: 'white' }}>
//                     {/* Tree branch with spiral */}
//                     <path
//                         d="M300 420 C300 420 300 380 300 380
//                C300 380 290 360 260 370
//                C230 380 240 390 260 400
//                C280 410 320 410 340 400
//                C360 390 370 380 340 370
//                C310 360 300 380 300 380"
//                         fill="none"
//                         stroke="#8B4513"
//                         strokeWidth="3"
//                     />
//
//                     {/* Tree crown outline - just the stroke */}
//                     <path
//                         d="M300 100
//                C200 100 100 200 100 300
//                C100 400 200 450 300 450
//                C400 450 500 400 500 300
//                C500 200 400 100 300 100"
//                         fill="white"
//                         stroke="#228B22"
//                         strokeWidth="3"
//                     />
//
//                     {/* Interactive apples */}
//                     {applePositions.map((apple) => (
//                         <DialogTrigger key={apple.id} asChild>
//                             <g
//                                 onClick={() => {
//                                     setSelectedApple(apple);
//                                     if (onAppleClick) onAppleClick(apple);
//                                 }}
//                                 className="cursor-pointer transition-transform hover:scale-110"
//                                 role="button"
//                                 aria-label={`Apple with message: ${apple.message}`}
//                             >
//                                 {/* Apple stem */}
//                                 <line
//                                     x1={apple.position.x}
//                                     y1={apple.position.y - 5}
//                                     x2={apple.position.x}
//                                     y2={apple.position.y - 15}
//                                     stroke="#634B3F"
//                                     strokeWidth="1.5"
//                                 />
//                                 {/* Heart-shaped apple */}
//                                 <path
//                                     d={`M ${apple.position.x} ${apple.position.y}
//                      c -10,-10 -20,0 -20,10
//                      c 0,20 20,30 30,30
//                      c 10,0 30,-10 30,-30
//                      c 0,-10 -10,-20 -20,-10`}
//                                     fill="#FFA07A"
//                                 />
//                             </g>
//                         </DialogTrigger>
//                     ))}
//                 </svg>
//
//                 {selectedApple && (
//                     <DialogContent className="sm:max-w-md">
//                         <DialogHeader>
//                             <DialogTitle>Message</DialogTitle>
//                             <DialogDescription>
//                                 {selectedApple.message}
//                             </DialogDescription>
//                         </DialogHeader>
//                     </DialogContent>
//                 )}
//             </Dialog>
//         </div>
//     );
// };
//
// export default OutlinedTree;

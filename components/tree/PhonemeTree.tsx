import React from 'react';
import {Dialog, DialogContent, DialogTitle} from '@/components/ui/dialog';
import {AppleProps, Letter} from './types';
import PhonemeCard from "@/components/tree/PhonemeCard";

// Apple Component with fixed position inside leaf cluster
const Apple: React.FC<AppleProps> = ({ letter, onClick, isSelected }) => {
    return (
        <g
            onClick={() => onClick(letter)}
            className="cursor-pointer transition-transform hover:scale-105"
            style={{ transform: `translate(${letter.position.x}px, ${letter.position.y}px)` }}
        >
            <circle
                r="18"
                fill={letter.color}
                className={`transition-all duration-300 ${
                    isSelected ? 'filter brightness-110' : ''
                }`}
                style={{
                    filter: 'drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.1))'
                }}
            />
            <text
                textAnchor="middle"
                dy="6"
                fontSize="16"
                className="fill-gray-800 font-bold select-none"
            >
                {letter.char}
            </text>
        </g>
    );
};

// Tree Branch Component
// const TreeBranch: React.FC<TreeBranchProps> = ({
//                                                    startX,
//                                                    startY,
//                                                    endX,
//                                                    endY,
//                                                    thickness = 10
//                                                }) => {
//     return (
//         <path
//             d={`M ${startX} ${startY} Q ${(startX + endX) / 2} ${
//                 (startY + endY) / 2 - 20
//             } ${endX} ${endY}`}
//             stroke="#475569"
//             strokeWidth={thickness}
//             fill="none"
//             strokeLinecap="round"
//         />
//     );
// };

// Leaf Cluster Component
// const LeafCluster: React.FC<{
//     x: number;
//     y: number;
//     rotation?: number;
//     scale?: number;
// }> = ({ x, y, rotation = 0, scale = 1 }) => {
//     return (
//         <g transform={`translate(${x}, ${y}) rotate(${rotation}) scale(${scale})`}>
//             <path
//                 d="M0,0 C-50,-30 -50,-90 0,-100 C50,-90 50,-30 0,0"
//                 fill="#4ADE80"
//                 className="animate-sway"
//             />
//             <path
//                 d="M0,-20 C-30,-40 -30,-80 0,-90 C30,-80 30,-40 0,-20"
//                 fill="#86EFAC"
//                 className="animate-sway-delay"
//             />
//         </g>
//     );
// };

// Main Tree Component
const AlphabetTree: React.FC<{
    selectedLetter: Letter | null;
    onLetterSelect: (letter: Letter) => void;
}> = ({
          selectedLetter,
          onLetterSelect
      }) => {
    return (
        <svg viewBox="0 0 800 600" className="w-full h-full">
            {/* Tree Structure */}
            <g>
                {/* Main Trunk */}
                <rect
                    x="385"
                    y="250"
                    width="30"
                    height="150"
                    fill="#475569"
                    rx="2"
                />

                {/* Branch Base */}
                <path
                    d="M300,250 L500,250 C450,220 350,220 300,250"
                    fill="#475569"
                />

                {/* Left Branch */}
                <path
                    d="M300,250 C250,230 200,240 180,260"
                    stroke="#475569"
                    strokeWidth="40"
                    strokeLinecap="round"
                    fill="none"
                />

                {/* Right Branch */}
                <path
                    d="M500,250 C550,230 600,240 620,260"
                    stroke="#475569"
                    strokeWidth="40"
                    strokeLinecap="round"
                    fill="none"
                />
            </g>

            {/* Leaf Clusters */}
            <g className="leaf-clusters">
                {/* Left Cluster */}
                <path
                    d="M150,200 C150,150 300,150 300,200 C300,250 150,250 150,200"
                    fill="#4ADE80"
                    className="animate-sway"
                />

                {/* Center Cluster */}
                <path
                    d="M350,150 C350,100 450,100 450,150 C450,200 350,200 350,150"
                    fill="#4ADE80"
                    className="animate-sway-delay"
                />

                {/* Right Cluster */}
                <path
                    d="M500,200 C500,150 650,150 650,200 C650,250 500,250 500,200"
                    fill="#4ADE80"
                    className="animate-sway"
                />
            </g>

            {/* Letters */}
            {alphabetData.map((letter) => (
                <Apple
                    key={letter.char}
                    letter={letter}
                    onClick={onLetterSelect}
                    isSelected={selectedLetter?.char === letter.char}
                />
            ))}
        </svg>
    );
};

// Positioning of letters in clusters
// Updated letter positions to match the image
const alphabetData: Letter[] = [
    // Left cluster
    { char: 'A', position: { x: 250, y: 240 }, color: '#FF6B6B', phonemes: [] },
    { char: 'B', position: { x: 290, y: 120 }, color: '#87CEEB', phonemes: [] },
    { char: 'C', position: { x: 240, y: 170 }, color: '#FFD700', phonemes: [] },
    { char: 'D', position: { x: 280, y: 150 }, color: '#FF9A9E', phonemes: [] },
    { char: 'E', position: { x: 260, y: 190 }, color: '#98FB98', phonemes: [] },

    // Center cluster
    { char: 'F', position: { x: 370, y: 120 }, color: '#FF9A9E', phonemes: [] },
    { char: 'G', position: { x: 410, y: 120 }, color: '#87CEEB', phonemes: [] },
    { char: 'H', position: { x: 390, y: 140 }, color: '#DDA0DD', phonemes: [] },
    { char: 'I', position: { x: 370, y: 160 }, color: '#98FB98', phonemes: [] },
    { char: 'J', position: { x: 410, y: 160 }, color: '#E6E6FA', phonemes: [] },

    // Right cluster
    { char: 'K', position: { x: 510, y: 140 }, color: '#FFD700', phonemes: [] },
    { char: 'L', position: { x: 550, y: 120 }, color: '#FF9A9E', phonemes: [] },
    { char: 'M', position: { x: 500, y: 170 }, color: '#FFD700', phonemes: [] },
    { char: 'N', position: { x: 540, y: 150 }, color: '#FF9A9E', phonemes: [] },
    { char: 'O', position: { x: 520, y: 190 }, color: '#98FB98', phonemes: [] },
];



// Main Component
export const PhonemeTree: React.FC = () => {
    const [selectedLetter, setSelectedLetter] = React.useState<Letter | null>(null);


    console.log(selectedLetter)

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="relative aspect-[4/3]">
                <AlphabetTree
                    selectedLetter={selectedLetter}
                    onLetterSelect={setSelectedLetter}
                />
            </div>


            <Dialog open={!!selectedLetter} onOpenChange={() => setSelectedLetter(null)}>
                <DialogTitle>Detalhes da Letra</DialogTitle>
                <DialogContent>
                    {selectedLetter && (
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold text-center">
                                Letra {selectedLetter.char}
                            </h2>

                            {selectedLetter.phonemes.map((phoneme, index) => (
                                <PhonemeCard
                                    key={index}
                                    phoneme={phoneme}
                                    onClose={() => setSelectedLetter(null)}
                                />
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PhonemeTree;
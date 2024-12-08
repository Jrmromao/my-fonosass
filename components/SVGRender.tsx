import React, { useState } from 'react';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import SvgImage from "@/components/SVGImage";
import {random} from "nanoid";
import AppleComponent from "@/components/AppleComponent";

// const AppleComponent = ({ x, y, phoneme, size = 25, handleAppleClick = () => {} }) => {
//     const [isHovered, setIsHovered] = useState(false);
//
//     return (
//         <g transform={`translate(${x}, ${y})`}
//            className="transition-transform duration-200 hover:animate-[tremble_0.2s_ease-in-out_infinite]"
//            onClick={handleAppleClick}>
//             <defs>
//                 <radialGradient id={`apple-gradient-${x}-${y}`} cx="0.3" cy="0.3" r="0.8">
//                     <stop offset="0%" stopColor="#ff6b6b"/>
//                     <stop offset="90%" stopColor="#c92a2a"/>
//                 </radialGradient>
//                 <filter id={`shadow-${x}-${y}`}>
//                     <feDropShadow dx="1" dy="1" stdDeviation="1" floodOpacity="0.3"/>
//                 </filter>
//             </defs>
//
//             <circle
//                 cx="0"
//                 cy="0"
//                 r={size}
//                 fill={`url(#apple-gradient-${x}-${y})`}
//                 filter={`url(#shadow-${x}-${y})`}
//             />
//
//             <circle
//                 cx="-8"
//                 cy="-8"
//                 r="8"
//                 fill="rgba(255, 255, 255, 0.2)"
//             />
//
//             <path
//                 d="M 0,-25 C -3,-28 -1,-35 2,-38"
//                 stroke="#594838"
//                 strokeWidth="3"
//                 fill="none"
//             />
//
//             <path
//                 d="M 2,-35 C 8,-38 12,-36 14,-32"
//                 fill="#498044"
//                 stroke="#498044"
//                 strokeWidth="1"
//             />
//
//             <text
//                 x="0"
//                 y="8"
//                 textAnchor="middle"
//                 fontSize="18"
//                 fontFamily="Arial"
//                 fontWeight="bold"
//                 fill="#FFFFFF"
//                 style={{
//                     pointerEvents: 'none',
//                     userSelect: 'none',
//                     filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.3))'
//                 }}
//             >
//                 {phoneme === "B" ? "B" :phoneme}
//             </text>
//
//             {isHovered && (
//                 <path
//                     d="M 0,0 L 15,-10 L 5,-10 L 5,-20 L -5,-20 L -5,-10 L -15,-10 Z"
//                     fill="#000" // or any color you want for the arrow
//                     transform="translate(0, -40)" // Adjust position as needed
//                 />
//             )}
//         </g>
//     );
// }

const SVGRender = () => {
    const [selectedApple, setSelectedApple] = useState<number | null>(null);

    const handleAppleClick = (appleId: number) => {
        setSelectedApple(appleId);
    };

    const closeModal = () => {
        setSelectedApple(null);
    };
    function getRandomNumber(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const getAppleMessage = (appleId: number) => {
        const messages: { [key: number]: string } = {
            1: "A fresh red apple that recently fell from the tree.",
            2: "This apple has a beautiful crimson color.",
            3: "A perfectly ripe apple with a mix of red and yellow.",
            4: "A large, juicy-looking apple.",
            5: "A slightly bruised apple from the fall, but still good."
        };
        return messages[appleId] || "An apple";
    };

    // Ground apples positions
    const groundApples = [
        {x: 350, y: 680, rotate: 15, scale: 1.1, id: 1, phoneme: "B", size: getRandomNumber(17, 30)},
        {x: 390, y: 680, rotate: -10, scale: 0.9, id: 2, phoneme: "B", size: getRandomNumber(17, 30)},
        {x: 350, y: 680, rotate: 5, scale: 1, id: 3, phoneme: "B", size: getRandomNumber(17, 30)},
        {x: 450, y: 680, rotate: -20, scale: 1.2, id: 4, phoneme: "B", size: getRandomNumber(17, 30)},
        {x: 500, y: 680, rotate: 8, scale: 0.95, id: 5, phoneme: "B", size: getRandomNumber(17, 30)},
    ];

    const treeApples = [
        {x: 350, y: 145, size: getRandomNumber(17, 35), phoneme: "B"},
        {x: 387, y: 180, size: getRandomNumber(17, 35), phoneme: "P"},
        {x: 450, y: 160, size: getRandomNumber(17, 35), phoneme: "M"},
        {x: 520, y: 125, size: getRandomNumber(17, 35), phoneme: "T"},
        {x: 590, y: 170, size: getRandomNumber(17, 30), phoneme: "D"},
        {x: 670, y: 140, size: getRandomNumber(17, 30), phoneme: "K"},
        {x: 340, y: 230, size: getRandomNumber(17, 30), phoneme: "G"},
        {x: 410, y: 250, size: getRandomNumber(17, 30), phoneme: "F"},
        {x: 480, y: 220, size: getRandomNumber(17, 30), phoneme: "V"},
        {x: 550, y: 240, size: getRandomNumber(17, 30), phoneme: "S"},
        {x: 620, y: 210, size: getRandomNumber(17, 30), phoneme: "Z"},
        {x: 370, y: 290, size: getRandomNumber(17, 30), phoneme: "SH"},
        {x: 440, y: 290, size: getRandomNumber(17, 30), phoneme: "CH"},
        {x: 510, y: 280, size: getRandomNumber(17, 30), phoneme: "J"},
        {x: 580, y: 300, size: getRandomNumber(17, 30), phoneme: "L"},
        {x: 650, y: 270, size: getRandomNumber(17, 30), phoneme: "R"},
        {x: 400, y: 350, size: getRandomNumber(17, 30), phoneme: "W"},
        {x: 470, y: 330, size: getRandomNumber(17, 30), phoneme: "H"},
        {x: 540, y: 340, size: getRandomNumber(17, 30), phoneme: "Y"},
        {x: 660, y: 360, size: getRandomNumber(17, 30), phoneme: "NG"},
        {x: 730, y: 330, size: getRandomNumber(17, 30), phoneme: "TH"},
        {x: 350, y: 410, size: getRandomNumber(17, 30), phoneme: "DH"},
        {x: 600, y: 390, size: getRandomNumber(17, 30), phoneme: "N"}
    ];

    return (
        <div className="w-full aspect-[10/7] relative">
            <div className="absolute inset-0">
                <svg
                    viewBox="0 0 1100 900"
                    preserveAspectRatio="xMidYMid meet"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                    style={{ touchAction: 'none' }}
                >
                    <SvgImage />

                    {treeApples.map((apple, index) => (
                        <AppleComponent
                            key={`tree-${index}`}
                            {...apple}
                            handleAppleClick={() => handleAppleClick(index)}
                        />
                    ))}

                    {groundApples.map((apple, index) => (
                        <AppleComponent
                            key={`ground-${index}`}
                            {...apple}
                            handleAppleClick={() => handleAppleClick(index)}
                        />
                    ))}
                </svg>
            </div>

            <AlertDialog open={selectedApple !== null} onOpenChange={closeModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apple #{selectedApple}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedApple !== null && getAppleMessage(selectedApple)}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default SVGRender;
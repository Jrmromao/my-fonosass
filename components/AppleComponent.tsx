import React, { useState } from 'react';
import AppleSvg from "@/components/AppleSVG";

interface AppleComponentProps {
    x: number;
    y: number;
    phoneme: string;
    size?: number;
    handleAppleClick?: () => void;
}

const AppleComponent: React.FC<AppleComponentProps> = ({
                                                           x,
                                                           y,
                                                           phoneme,
                                                           size = 23,
                                                           handleAppleClick = () => {}
                                                       }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <g
            transform={`translate(${x}, ${y})`}
            className="transition-transform duration-200 hover:animate-[tremble_0.2s_ease-in-out_infinite] cursor-pointer data-h"
            onClick={handleAppleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <defs>
                <radialGradient id={`apple-gradient-${x}-${y}`} cx="0.3" cy="0.3" r="0.8">
                    <stop offset="0%" stopColor="#ff6b6b"/>
                    <stop offset="90%" stopColor="#c92a2a"/>
                </radialGradient>
                <filter id={`shadow-${x}-${y}`}>
                    <feDropShadow dx="1" dy="1" stdDeviation="1" floodOpacity="0.3"/>
                </filter>
            </defs>


            {/* Circle with gradient */}
            <circle
                cx="0"
                cy="0"
                r={size}
                fill={`url(#apple-gradient-${x}-${y})`}
                filter={`url(#shadow-${x}-${y})`}
            />

            {/* Highlight on the apple */}
            <circle
                cx="-8"
                cy="-8"
                r="8"
                fill="rgba(255, 255, 255, 0.2)"
            />

            {/* Apple stem */}
            <path
                d="M 0,-25 C -3,-28 -1,-35 2,-38"
                stroke="#594838"
                strokeWidth="3"
                fill="none"
            />

            {/* Apple leaf */}
            <path
                d="M 2,-35 C 8,-38 12,-36 14,-32"
                fill="#498044"
                stroke="#498044"
                strokeWidth="1"
            />

            {/* Dynamic phoneme text */}
            <text
                x="0"
                y="8"
                textAnchor="middle"
                fontSize="18"
                fontFamily="Arial"
                fontWeight="bold"
                fill="#FFFFFF"
                style={{
                    pointerEvents: 'none',
                    userSelect: 'none',
                    filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.3))'
                }}
            >
                {phoneme}
            </text>

            {/* Conditional hover tooltip */}
            {/*{isHovered && (*/}
            {/*    <path*/}
            {/*        d="M 0,0 L 15,-10 L 5,-10 L 5,-20 L -5,-20 L -5,-10 L -15,-10 Z"*/}
            {/*        fill="#000"*/}
            {/*        transform="translate(0, -40)"*/}
            {/*    />*/}
            {/*)}*/}

            <g transform={`scale(${size / 25}) translate(-12, -12)`}>
                <AppleSvg width={size} height={size}/>
            </g>
        </g>
    );
};

export default AppleComponent;

"use client"; // Ensure this is a client component

import React, { useState, useEffect, useRef } from "react";
import {
    Cat,
    Palette,
    Car,
    Briefcase,
    Shirt,
    MessageSquare,
    Triangle,
    User,
    Hash,
    Smile,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Define TypeScript interfaces
interface Category {
    label: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    darkBgColor: string;
}

interface ToolbarButtonProps {
    category: Category;
    index: number;
}

const EducationalToolbar: React.FC = () => {
    const [activeTab, setActiveTab] = useState<number>(0);
    const [hoveredTab, setHoveredTab] = useState<number | null>(null);
    const [bubbles, setBubbles] = useState<React.ReactNode[]>([]); // State for bubbles

    // Playful, child-friendly categories with bright colors
    const categories: Category[] = [
        {
            label: "Animais",
            icon: <Cat size={24} />,
            color: "#FF6B6B", // Bright red
            bgColor: "#FFEEEE",
            darkBgColor: "#4D0000",
        },
        {
            label: "Cores",
            icon: <Palette size={24} />,
            color: "#FF9E40", // Orange
            bgColor: "#FFF3E0",
            darkBgColor: "#4D2800",
        },
        {
            label: "Meios de transporte",
            icon: <Car size={24} />,
            color: "#FFDA45", // Yellow
            bgColor: "#FFFDE7",
            darkBgColor: "#4D4000",
        },
        {
            label: "Profissões",
            icon: <Briefcase size={24} />,
            color: "#48DA89", // Green
            bgColor: "#E8F5E9",
            darkBgColor: "#003D00",
        },
        {
            label: "Vestuário",
            icon: <Shirt size={24} />,
            color: "#64C9E2", // Light Blue
            bgColor: "#E3F2FD",
            darkBgColor: "#00384D",
        },
        {
            label: "Linguagem",
            icon: <MessageSquare size={24} />,
            color: "#5B6DEE", // Blue
            bgColor: "#E8EAF6",
            darkBgColor: "#00004D",
        },
        {
            label: "Figuras geométricas",
            icon: <Triangle size={24} />,
            color: "#B278EF", // Purple
            bgColor: "#F3E5F5",
            darkBgColor: "#3F004D",
        },
        {
            label: "Corpo humano",
            icon: <User size={24} />,
            color: "#FF69B4", // Hot Pink
            bgColor: "#FCE4EC",
            darkBgColor: "#4D0033",
        },
        {
            label: "Números e letras",
            icon: <Hash size={24} />,
            color: "#FFA726", // Amber
            bgColor: "#FFF8E1",
            darkBgColor: "#4D3200",
        },
        {
            label: "Motricidade",
            icon: <Smile size={24} />, // Using Smile icon for motricidade (lips/tongue motor skills)
            color: "#26C6DA", // Cyan
            bgColor: "#E0F7FA",
            darkBgColor: "#006064",
        },
    ];

    // Generate bubbles only on client-side mount
    useEffect(() => {
        const generatedBubbles: React.ReactNode[] = [];
        for (let i = 0; i < 10; i++) {
            const size = Math.random() * 15 + 10;
            generatedBubbles.push(
                <motion.div
                    key={i}
                    className="absolute rounded-full opacity-20"
                    style={{
                        width: size,
                        height: size,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        backgroundColor: categories[i % categories.length].color,
                        zIndex: 1,
                    }}
                    initial={{
                        y: Math.random() * 20,
                        x: Math.random() * 20,
                    }}
                    animate={{
                        y: [Math.random() * 20, -(Math.random() * 20 + 10)],
                        x: [Math.random() * 20, Math.random() * 15 - 7.5],
                    }}
                    transition={{
                        duration: Math.random() * 2 + 3,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                        delay: Math.random() * 2,
                    }}
                />
            );
        }
        setBubbles(generatedBubbles);
    }, []); // Empty dependency array ensures this runs only once on mount

    // Individual toolbar item with fun animations
    const ToolbarButton: React.FC<ToolbarButtonProps> = ({ category, index }) => {
        const isActive = activeTab === index;
        const isHovered = hoveredTab === index;

        return (
            <motion.div
                className="relative"
                onHoverStart={() => setHoveredTab(index)}
                onHoverEnd={() => setHoveredTab(null)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <button
                    onClick={() => setActiveTab(index)}
                    className={`relative flex flex-col items-center justify-center p-2 w-full rounded-xl overflow-hidden transition-all duration-200`}
                    style={{
                        backgroundColor: isActive ? category.color : "transparent",
                        border: isActive
                            ? `3px solid ${category.color}`
                            : isHovered
                                ? `2px solid ${category.color}`
                                : `2px solid transparent`,
                        zIndex: 10,
                    }}
                >
                    {/* Fun background for children */}
                    <div
                        className={`absolute inset-0 opacity-10 transition-opacity duration-200 ${
                            isActive || isHovered ? "opacity-20" : "opacity-0"
                        }`}
                        style={{ backgroundColor: category.color }}
                    ></div>

                    {/* Icon with bouncy animation */}
                    <motion.div
                        className={`relative w-12 h-12 mb-1 rounded-full flex items-center justify-center transition-colors duration-200`}
                        style={{
                            backgroundColor: isActive
                                ? "white"
                                : isHovered
                                    ? `${category.bgColor}`
                                    : "transparent",
                            color: category.color,
                            boxShadow: isActive || isHovered ? "0 4px 8px rgba(0,0,0,0.1)" : "none",
                        }}
                        animate={
                            isActive
                                ? { y: [0, -5, 0] }
                                : isHovered
                                    ? { scale: [1, 1.1, 1.05] }
                                    : {}
                        }
                        transition={{
                            duration: 0.5,
                            repeat: isActive ? Infinity : 0,
                            repeatType: "reverse",
                            ease: "easeInOut",
                        }}
                    >
                        {category.icon}
                    </motion.div>

                    {/* Label with fun font */}
                    <span
                        className={`text-xs font-bold transition-colors duration-200 w-full text-center`}
                        style={{
                            color: isActive ? "white" : category.color,
                        }}
                    >
            {category.label}
          </span>

                    {/* Fun confetti animation when activated */}
                    <AnimatePresence>
                        {isActive && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 overflow-hidden pointer-events-none"
                            >
                                {[...Array(4)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute rounded-full w-2 h-2"
                                        style={{
                                            left: `${50 + (Math.random() * 40 - 20)}%`,
                                            top: `${50 + (Math.random() * 40 - 20)}%`,
                                            backgroundColor: "white",
                                            opacity: Math.random() * 0.5 + 0.3,
                                        }}
                                        initial={{ scale: 0, x: 0, y: 0 }}
                                        animate={{
                                            scale: Math.random() * 1.5 + 0.5,
                                            x: Math.random() * 40 - 20,
                                            y: Math.random() * 40 - 20,
                                            opacity: 0,
                                        }}
                                        transition={{
                                            duration: Math.random() * 0.8 + 0.5,
                                            repeat: Infinity,
                                            repeatType: "loop",
                                            repeatDelay: Math.random() * 0.5 + 0.5,
                                            ease: "easeOut",
                                        }}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>
            </motion.div>
        );
    };

    return (
        <div className="relative rounded-2xl overflow-hidden shadow-lg border-4 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900">
            {/* Playful background bubbles */}
            <div className="absolute inset-0 overflow-hidden">{bubbles}</div>

            {/* Rainbow border effect - with proper z-index */}
            <div
                className="absolute inset-0 border-8 border-transparent rounded-xl z-5"
                style={{
                    background: `linear-gradient(90deg, 
            ${categories[0].color}, 
            ${categories[1].color}, 
            ${categories[2].color}, 
            ${categories[3].color}, 
            ${categories[4].color}, 
            ${categories[5].color}, 
            ${categories[6].color}, 
            ${categories[7].color},
            ${categories[8].color},
            ${categories[9].color}) border-box`,
                    mask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
                    maskComposite: "exclude",
                }}
            ></div>

            {/* Main toolbar with fun, rounded buttons */}
            <div className="relative grid grid-cols-5 md:grid-cols-10 gap-3 p-4 z-10">
                {categories.map((category, index) => (
                    <ToolbarButton key={index} category={category} index={index} />
                ))}
            </div>
        </div>
    );
};

export default EducationalToolbar;
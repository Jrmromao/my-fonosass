"use client"; // Ensure this is a client component

import React, {useState, useEffect, useTransition, useCallback} from "react";
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
    X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PhonemeDialog from "@/components/dialogs/phonemeDialog";
import { getColorName } from "@/utils/phonemeList";
import {ActivityWithFiles} from "@/types/activity";
import {getFileDownloadUrl} from "@/lib/actions/file-download.action";

// Define TypeScript interfaces
interface Category {
    label: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    darkBgColor: string;
    content?: string; // Content to display in the dialog
}



interface ToolbarButtonProps {
    category: Category;
    index: number;
    onClick: (index: number) => void;
}

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    category: Category | null;
}

const EducationalToolbar: React.FC = () => {
    const [activeTab, setActiveTab] = useState<number>(0);
    const [hoveredTab, setHoveredTab] = useState<number | null>(null);
    const [bubbles, setBubbles] = useState<React.ReactNode[]>([]);

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const handleFileDownload = useCallback(async (fileId: string, fileName: string) => {

        try {
            setDownloadingFileId(fileId);
            setDownloadError(null);

            const result = await getFileDownloadUrl({fileId});

            if (result.success) {
                // Create a temporary link element
                const link = document.createElement('a');
                //@ts-ignore
                link.href = result.url;
                const safeFileName = fileName || `activity-${fileId}.pdf`;
                link.setAttribute('download', safeFileName);

                // Required for Firefox
                document.body.appendChild(link);

                // Trigger download
                link.click();

                // Cleanup
                document.body.removeChild(link);

                // Show success state briefly
                setDownloadSuccess(fileId);
                setTimeout(() => {
                    setDownloadSuccess(null);
                }, 2000);
            } else {
                setDownloadError(fileId);
                setTimeout(() => {
                    setDownloadError(null);
                }, 3000);
            }
        } catch (error) {
            console.error("Download failed:", error);
            setDownloadError(fileId);
            setTimeout(() => {
                setDownloadError(null);
            }, 3000);
        } finally {
            setDownloadingFileId(null);
        }
    }, []);

    // Playful, child-friendly categories with bright colors
    const categories: Category[] = [
        {
            label: "Animais",
            icon: <Cat size={24} />,
            color: "#FF6B6B", // Bright red
            bgColor: "#FFEEEE",
            darkBgColor: "#4D0000",
            content: "Explore diferentes animais e seus sons. Ótimo para desenvolver vocabulário e consciência fonológica."
        },
        {
            label: "Cores",
            icon: <Palette size={24} />,
            color: "#FF9E40", // Orange
            bgColor: "#FFF3E0",
            darkBgColor: "#4D2800",
            content: "Aprenda sobre cores primárias e secundárias através de atividades divertidas e interativas."
        },
        {
            label: "Meios de transporte",
            icon: <Car size={24} />,
            color: "#FFDA45", // Yellow
            bgColor: "#FFFDE7",
            darkBgColor: "#4D4000",
            content: "Descubra diferentes meios de transporte e os sons que eles fazem. Excelente para trabalhar onomatopeias."
        },
        {
            label: "Profissões",
            icon: <Briefcase size={24} />,
            color: "#48DA89", // Green
            bgColor: "#E8F5E9",
            darkBgColor: "#003D00",
            content: "Explore diferentes profissões e vocabulário relacionado ao mundo do trabalho."
        },
        {
            label: "Vestuário",
            icon: <Shirt size={24} />,
            color: "#64C9E2", // Light Blue
            bgColor: "#E3F2FD",
            darkBgColor: "#00384D",
            content: "Aprenda sobre diferentes peças de roupa e quando utilizá-las."
        },
        {
            label: "Linguagem",
            icon: <MessageSquare size={24} />,
            color: "#5B6DEE", // Blue
            bgColor: "#E8EAF6",
            darkBgColor: "#00004D",
            content: "Exercícios focados em desenvolvimento de fala, vocabulário e gramática."
        },
        {
            label: "Figuras geométricas",
            icon: <Triangle size={24} />,
            color: "#B278EF", // Purple
            bgColor: "#F3E5F5",
            darkBgColor: "#3F004D",
            content: "Aprenda sobre formas geométricas básicas através de jogos e atividades."
        },
        {
            label: "Corpo humano",
            icon: <User size={24} />,
            color: "#FF69B4", // Hot Pink
            bgColor: "#FCE4EC",
            darkBgColor: "#4D0033",
            content: "Conheça as partes do corpo e suas funções com atividades lúdicas."
        },
        {
            label: "Números e letras",
            icon: <Hash size={24} />,
            color: "#FFA726", // Amber
            bgColor: "#FFF8E1",
            darkBgColor: "#4D3200",
            content: "Aprenda os números e o alfabeto com exercícios adequados para cada faixa etária."
        },
        {
            label: "Motricidade",
            icon: <Smile size={24} />, // Using Smile icon for motricidade (lips/tongue motor skills)
            color: "#26C6DA", // Cyan
            bgColor: "#E0F7FA",
            darkBgColor: "#006064",
            content: "Atividades para desenvolver a motricidade oral e facial, fundamentais para a fala."
        },
    ];

    // Handle button click to open dialog
    const handleCategoryClick = (index: number) => {
        setActiveTab(index);
        setSelectedCategory(categories[index]);
        setDialogOpen(true);
    };
    const handleCloseDialog = (): void => {
        setDialogOpen(false);
    };

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
    const ToolbarButton: React.FC<ToolbarButtonProps> = ({ category, index, onClick }) => {
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
                    onClick={() => onClick(index)}
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

    const [activities, setActivities] = useState<ActivityWithFiles[]>([]);
    const [isPending, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(false);
    const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
    const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
    const [downloadError, setDownloadError] = useState<string | null>(null);

    return (
        <>
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
                        <ToolbarButton
                            key={index}
                            category={category}
                            index={index}
                            onClick={handleCategoryClick}
                        />
                    ))}
                </div>
            </div>

            {/* Dialog component */}
         <PhonemeDialog setDialogOpen={setDialogOpen} dialogOpen={dialogOpen} activeColor={categories[activeTab].color}
                        activePhoneme={categories[activeTab].label} activities={activities} isLoading={isLoading}
                        isPending={isPending} downloadingFileId={downloadingFileId} downloadSuccess={downloadSuccess}
                        downloadError={downloadError} handleFileDownload={handleFileDownload}
                        handleCloseDialog={handleCloseDialog} getColorName={getColorName}/>
        </>
    );
};

export default EducationalToolbar;
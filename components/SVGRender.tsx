import React, { useState, useMemo, useCallback } from 'react';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import SvgImage from "@/components/SVGImage";
import AppleComponent from "@/components/AppleComponent";
import { AppleType } from "@/types/types";

// Make sure AppleComponent expects handleAppleClick as a prop
// If you're seeing a type error, you may need to update your AppleType interface or component props:

const SVGRender = () => {
    const [selectedApple, setSelectedApple] = useState<AppleType | null>(null);

    // Memoize the event handler to prevent unnecessary re-creation
    const handleAppleClick = useCallback((apple: AppleType) => {
        setSelectedApple(apple);
    }, []);

    // Memoize the close function
    const closeModal = useCallback(() => {
        setSelectedApple(null);
    }, []);

    // Memoize the random number generator to ensure stable reference
    const getRandomNumber = useCallback((min: number, max: number) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }, []);

    // Memoize the message function to prevent recreation on render
    const getAppleMessage = useCallback((phoneme: string) => {
        const messages: { [key: string]: string } = {
            // Plosives
            "B": "A fresh red apple that recently fell from the tree.",
            "P": "This apple has a beautiful crimson color.",
            "T": "A crisp, tart apple perfect for baking.",
            "D": "A dark red apple with a sweet taste.",
            "K": "A firm apple with a balanced flavor.",
            "G": "A green apple with a sour punch.",

            // Fricatives
            "F": "A flawless apple with shiny skin.",
            "V": "A perfectly ripe apple with a mix of red and yellow.",
            "S": "A small, sweet apple great for snacking.",
            "Z": "A zesty apple with bright flavor.",
            "SH": "A shiny apple with smooth skin.",
            "CH": "A chunky apple perfect for pies.",
            "J": "A juicy apple that drips when bitten.",
            "TH": "A thick-skinned apple that stores well.",
            "DH": "A delightfully tasty heritage variety.",

            // Sonorants
            "M": "A magnificent apple from a special tree.",
            "N": "A nutritious apple packed with vitamins.",
            "NG": "An elongated apple variety from distant orchards.",
            "L": "A large apple that takes two hands to hold.",
            "R": "A ruby-red apple with rich flavor.",
            "W": "A wonderful apple that tastes like honey.",
            "Y": "A yellow apple with a hint of sweetness.",
            "H": "A healthy apple grown without pesticides.",

            // Special phonemes
            "Be": "A beautiful speckled apple variety.",
        };

        // Return matching message or default if phoneme not found
        return messages[phoneme] || `An apple representing the "${phoneme}" sound.`;
    }, []);

    // Memoize the groundApples array - only created once
    const groundApples = useMemo(() => [
        {id: "ground-1", x: 350, y: 680, rotate: 15, scale: 1.1, phoneme: "Be", size: getRandomNumber(17, 30)},
        {id: "ground-2", x: 390, y: 680, rotate: -10, scale: 0.9, phoneme: "B", size: getRandomNumber(17, 30)},
        {id: "ground-3", x: 350, y: 680, rotate: 5, scale: 1, phoneme: "B", size: getRandomNumber(17, 30)},
        {id: "ground-4", x: 450, y: 680, rotate: -20, scale: 1.2, phoneme: "B", size: getRandomNumber(17, 30)},
        {id: "ground-5", x: 500, y: 680, rotate: 8, scale: 0.95, phoneme: "B", size: getRandomNumber(17, 30)},
    ], [getRandomNumber]); // Depends only on the getRandomNumber function

    // Memoize the treeApples array - only created once
    const treeApples = useMemo(() => [
        {id: "tree-1", x: 350, y: 145, size: getRandomNumber(17, 35), phoneme: "B"},
        {id: "tree-2", x: 387, y: 180, size: getRandomNumber(17, 35), phoneme: "P"},
        {id: "tree-3", x: 450, y: 160, size: getRandomNumber(17, 35), phoneme: "M"},
        {id: "tree-4", x: 520, y: 125, size: getRandomNumber(17, 35), phoneme: "T"},
        {id: "tree-5", x: 590, y: 170, size: getRandomNumber(17, 30), phoneme: "D"},
        {id: "tree-6", x: 670, y: 140, size: getRandomNumber(17, 30), phoneme: "K"},
        {id: "tree-7", x: 340, y: 230, size: getRandomNumber(17, 30), phoneme: "G"},
        {id: "tree-8", x: 410, y: 250, size: getRandomNumber(17, 30), phoneme: "F"},
        {id: "tree-9", x: 480, y: 220, size: getRandomNumber(17, 30), phoneme: "V"},
        {id: "tree-10", x: 550, y: 240, size: getRandomNumber(17, 30), phoneme: "S"},
        {id: "tree-11", x: 620, y: 210, size: getRandomNumber(17, 30), phoneme: "Z"},
        {id: "tree-12", x: 370, y: 290, size: getRandomNumber(17, 30), phoneme: "SH"},
        {id: "tree-13", x: 440, y: 290, size: getRandomNumber(17, 30), phoneme: "CH"},
        {id: "tree-14", x: 510, y: 280, size: getRandomNumber(17, 30), phoneme: "J"},
        {id: "tree-15", x: 580, y: 300, size: getRandomNumber(17, 30), phoneme: "L"},
        {id: "tree-16", x: 650, y: 270, size: getRandomNumber(17, 30), phoneme: "R"},
        {id: "tree-17", x: 400, y: 350, size: getRandomNumber(17, 30), phoneme: "W"},
        {id: "tree-18", x: 470, y: 330, size: getRandomNumber(17, 30), phoneme: "H"},
        {id: "tree-19", x: 540, y: 340, size: getRandomNumber(17, 30), phoneme: "Y"},
        {id: "tree-20", x: 660, y: 360, size: getRandomNumber(17, 30), phoneme: "NG"},
        {id: "tree-21", x: 730, y: 330, size: getRandomNumber(17, 30), phoneme: "TH"},
        {id: "tree-22", x: 350, y: 410, size: getRandomNumber(17, 30), phoneme: "DH"},
        {id: "tree-23", x: 600, y: 390, size: getRandomNumber(17, 30), phoneme: "N"}
    ], [getRandomNumber]); // Depends only on the getRandomNumber function

    // There are two ways to fix the type error with handleAppleClick:

    // Option 1: Use the original approach from your code
    // This will work if your AppleComponent is already set up to accept this prop
    const handleAppleClickForApple = useCallback((apple: AppleType) => {
        return () => {
            setSelectedApple(apple);
        };
    }, []);

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

                    {/* Render tree apples */}
                    {treeApples.map((apple) => (
                        <AppleComponent
                            key={apple.id}
                            {...apple}
                            handleAppleClick={handleAppleClickForApple(apple)}
                        />
                    ))}

                    {/* Render ground apples */}
                    {groundApples.map((apple) => (
                        <AppleComponent
                            key={apple.id}
                            {...apple}
                            handleAppleClick={handleAppleClickForApple(apple)}
                        />
                    ))}
                </svg>
            </div>

            {/* Modal dialog with improved rendering control */}
            <AlertDialog open={selectedApple !== null} onOpenChange={closeModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {selectedApple ? `Phoneme #${selectedApple.phoneme}` : 'Apple'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedApple && getAppleMessage(selectedApple.phoneme)}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default SVGRender;
import React from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface PhonemeFilterProps {
    selectedPhoneme: string;
    setSelectedPhoneme: (phoneme: string) => void;
    availablePhonemes: string[];
}

const PhonemeFilter: React.FC<PhonemeFilterProps> = ({
                                                         selectedPhoneme,
                                                         setSelectedPhoneme,
                                                         availablePhonemes,
                                                     }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <span>{selectedPhoneme === "all" ? "Todos os Fonemas" : selectedPhoneme}</span>
                    <ChevronDown className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Selecionar Fonema</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setSelectedPhoneme("all")}>Todos os Fonemas</DropdownMenuItem>
                {availablePhonemes.map((phoneme) => (
                    <DropdownMenuItem key={phoneme} onClick={() => setSelectedPhoneme(phoneme)}>
                        {phoneme}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default PhonemeFilter;
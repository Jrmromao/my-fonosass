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

interface TypeFilterProps {
    selectedType: string;
    setSelectedType: (type: string) => void;
    availableTypes: string[];
}

const TypeFilter: React.FC<TypeFilterProps> = ({ selectedType, setSelectedType, availableTypes }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <span>{selectedType === "all" ? "Todos os Tipos" : selectedType}</span>
                    <ChevronDown className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Selecionar Tipo de Atividade</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setSelectedType("all")}>Todos os Tipos</DropdownMenuItem>
                {availableTypes.map((type) => (
                    <DropdownMenuItem key={type} onClick={() => setSelectedType(type)}>
                        {type}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default TypeFilter;
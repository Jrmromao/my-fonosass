import React, { useState, lazy, Suspense } from "react";
import {Row} from "@tanstack/react-table";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Lazy load the heavy modal component
const ExercisePreviewModal = lazy(() => import("@/components/dialogs/exercise-preview-modal").then(mod => ({ default: mod.ExercisePreviewModal })));

interface DataTableRowActionsProps<TData> {
    row: Row<TData>,
    onView?: (value: TData) => void,
    onDelete?: (value: TData) => void,
    onUpdate?: (value: TData) => void,
    onDisable?: (value: TData) => void,
    className?: string,
    role?: string | undefined
}

const DataTableRowActions = <TData, >({
                                          row,
                                          onView,
                                          onDelete,
                                          onUpdate,
                                          onDisable,
                                          className = "",
                                          role
                                      }: DataTableRowActionsProps<TData>) => {
    const [showPreview, setShowPreview] = useState(false);

    const handleDisable = () => {

    };

    const handleDelete = () => {

    };

    return (
        <div className={className}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button 
                        type="button"
                        className="inline-flex items-center justify-center w-8 h-8 cursor-pointer hover:bg-gray-100 rounded border-0 bg-transparent"
                        aria-label="Actions"
                    >
                        <span className="text-gray-600">⋯</span>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuCheckboxItem 
                        onClick={(e) => {
                            e.preventDefault();
                            setShowPreview(true);
                        }}
                        className="cursor-pointer"
                    >
                        <span className="text-gray-700">Visualizar</span>
                    </DropdownMenuCheckboxItem>
                    {onDelete && (
                        <DropdownMenuCheckboxItem onClick={() => handleDelete()} className="cursor-pointer">
                            <span className="text-gray-700">Delete</span>
                        </DropdownMenuCheckboxItem>
                    )}
                    {onDisable && (
                        <DropdownMenuCheckboxItem onClick={() => handleDisable()} className="cursor-pointer">
                            <span className="text-gray-700">Disable</span>
                        </DropdownMenuCheckboxItem>
                    )}
                    {onView && (
                        <DropdownMenuCheckboxItem onClick={() => onView(row.original)} className="cursor-pointer">
                            <span className="text-gray-700">View</span>
                        </DropdownMenuCheckboxItem>
                    )}
                    {onUpdate && (
                        <DropdownMenuCheckboxItem onClick={() => onUpdate(row.original)} className="cursor-pointer">
                            <span className="text-gray-700">Update</span>
                        </DropdownMenuCheckboxItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            
            {showPreview && (
                <Suspense fallback={<div>Loading preview...</div>}>
                    <ExercisePreviewModal 
                        exercise={row.original}
                        isOpen={showPreview}
                        onClose={() => setShowPreview(false)}
                    />
                </Suspense>
            )}
        </div>
    );
};

export default DataTableRowActions;

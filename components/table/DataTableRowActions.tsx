import React from "react";
import {Row} from "@tanstack/react-table";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    const handleDisable = () => {

    };

    const handleDelete = () => {

    };

    return (
        <div className={className}>
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <span className="cusor-pointer sr-only sm:not-sr-only">...</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {onDelete && (
                        <DropdownMenuCheckboxItem onClick={() => handleDelete()}>
                            <div className={"cursor-pointer text-[#344054]"}> Delete</div>
                        </DropdownMenuCheckboxItem>
                    )}
                    {onDisable && (
                        <DropdownMenuCheckboxItem onClick={() => handleDisable()}>
                            <div className={"cursor-pointer text-[#344054]"}> Delete</div>
                        </DropdownMenuCheckboxItem>
                    )}
                    {onView && (
                        <DropdownMenuCheckboxItem onClick={() => onView(row.original)}>
                            <div className={"cursor-pointer text-[#344054]"}>View</div>
                        </DropdownMenuCheckboxItem>
                    )}

                    {onUpdate && (
                        <DropdownMenuCheckboxItem onClick={() => onUpdate(row.original)}>
                            <div className={"cursor-pointer text-[#344054]"}>Update</div>
                        </DropdownMenuCheckboxItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default DataTableRowActions;

"use client";
import React, { useEffect, useState } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    PaginationState,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import TableSkeleton from "@/components/table/TableSkeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    isLoading?: boolean;
}

export function DataTable<TData, TValue>({
                                             columns,
                                             data,
                                             isLoading,
                                         }: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [isMobile, setIsMobile] = useState(false);

    // Safe window access after component is mounted
    useEffect(() => {
        // Set initial mobile state
        setIsMobile(window.innerWidth < 768);

        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        state: {
            sorting,
            columnVisibility,
            pagination: {
                pageIndex,
                pageSize,
            },
        },
    });

    const rows = table.getRowModel().rows;
    const hasRows = rows.length > 0;

    if (isLoading) {
        return <TableSkeleton columns={columns.length} rows={5} />;
    }

    return (
        <div className="w-full">
            {/* Desktop View */}
            <div className="hidden md:block rounded-lg border border-gray-200 dark:border-gray-900/30 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="h-11 px-6 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700"
                                    >
                                        {!header.isPlaceholder &&
                                            flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody className="bg-white dark:bg-gray-900">
                        {hasRows ? (
                            rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 last:border-none transition-colors"                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-sm text-gray-500 dark:text-gray-400"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {hasRows ? (
                    rows.map((row) => (
                        <Card key={row.id} className="p-4 bg-white dark:bg-gray-900 border-purple-100 dark:border-purple-900/30 shadow-sm">
                            <div className="space-y-3">
                                {row.getVisibleCells().map((cell, index) => {
                                    const headerValue = cell.column.columnDef.header;
                                    const header = typeof headerValue === 'function'
                                        ? cell.column.id
                                        : headerValue as string;

                                    // First cell gets special treatment (usually the name/title)
                                    if (index === 0) {
                                        return (
                                            <div key={cell.id} className="pb-2 mb-2 border-b border-purple-100 dark:border-purple-900/20">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div
                                            key={cell.id}
                                            className="flex justify-between items-center gap-2"
                                        >
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {header}
                      </span>
                                            <span className="text-sm text-gray-700 dark:text-gray-300 text-right">
                        {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                        )}
                      </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-8 bg-white dark:bg-gray-900 rounded-lg border border-purple-100 dark:border-purple-900/30">
                        No results.
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 px-2 gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <span>Rows per page</span>
                        <Select
                            value={pageSize.toString()}
                            onValueChange={(value) => table.setPageSize(Number(value))}
                        >
                            <SelectTrigger className="h-8 w-16 border-gray-200 dark:border-gray-700">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[10, 20, 30, 40, 50].map((size) => (
                                    <SelectItem key={size} value={size.toString()}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        Page {pageIndex + 1} of {table.getPageCount() || 1}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="h-8 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="h-8 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
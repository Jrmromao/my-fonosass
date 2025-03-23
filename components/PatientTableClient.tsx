// components/PatientTableClient.tsx
"use client"

import React, { useEffect, useState } from "react"
import { PatientListItem } from "@/models/patient"
import {
    ColumnDef, flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel, SortingState,
    useReactTable
} from "@tanstack/react-table";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Calendar, Clock, Filter, Search, User2} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

interface PatientTableClientProps {
    initialData: PatientListItem[]
}

export function PatientTableClient({ initialData }: PatientTableClientProps) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [patients, setPatients] = useState<PatientListItem[]>(initialData)
    const router = useRouter()

    const handleDetails = (id: string) => {
        router.push(`/dashboard/patient/${id}`)
    }



    const columns: ColumnDef<PatientListItem>[] = [
        {
            accessorKey: "name",
            header: "Paciente",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <User2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <div className="font-medium">{row.original.fullName}</div>
                        <div className="text-sm text-muted-foreground">ID: #{row.original.id}</div>
                    </div>
                </div>
            ),
        },
        // {row.getValue("firstName")}{row.getValue("lastName")}
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    row.getValue("status") === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
          {row.getValue("status")}
        </span>
            ),
        },
        {
            accessorKey: "nextAppointment",
            header: "Próxima Consulta",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {row.getValue("nextAppointment")}
                </div>
            ),
        },
        {
            accessorKey: "appointmentTime",
            header: "Horário",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {row.getValue("appointmentTime")}
                </div>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDetails(row.original.id)}
                >
                    Ver detalhes
                </Button>
            ),
        },
    ]

    const table = useReactTable({
        data: patients,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
    })

    return (
        <>
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"/>
                    <Input
                        placeholder="Buscar pacientes..."
                        className="pl-10"
                    />
                </div>
                <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2"/>
                    Filtros
                </Button>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Nenhum resultado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Anterior
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Próxima
                </Button>
            </div>
        </>
    )
}
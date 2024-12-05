// app/dashboard/activities/page.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Activity, FileText, Filter, Plus, Search } from 'lucide-react'
import { NewActivityDialog } from "@/components/dialogs/new-activity-dialog"

interface ActivityItem {
    id: string
    name: string
    type: string
    difficulty: string
    ageRange: string
    files: number
    status: "ACTIVE" | "INACTIVE"
}

export default function Page() {
    const [activities, setActivities] = useState<ActivityItem[]>([])

    return (
        <div className="h-full p-8 bg-white">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                        Atividades
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie todas as suas atividades terapêuticas
                    </p>
                </div>
                <NewActivityDialog />
            </div>

            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar atividades..."
                        className="pl-10"
                    />
                </div>
                <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                </Button>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Atividade</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Dificuldade</TableHead>
                            <TableHead>Faixa Etária</TableHead>
                            <TableHead>Arquivos</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activities.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    Nenhuma atividade encontrada
                                </TableCell>
                            </TableRow>
                        ) : (
                            activities.map((activity) => (
                                <TableRow key={activity.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                                <Activity className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium">{activity.name}</div>
                                                <div className="text-sm text-muted-foreground">ID: #{activity.id}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{activity.type}</TableCell>
                                    <TableCell>{activity.difficulty}</TableCell>
                                    <TableCell>{activity.ageRange}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-muted-foreground" />
                                            {activity.files}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            activity.status === "ACTIVE"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                        }`}>
                                            {activity.status === "ACTIVE" ? "Ativo" : "Inativo"}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm">
                                            Ver detalhes
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
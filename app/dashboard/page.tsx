'use client'
import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Bell, Calendar, FileText, User} from 'lucide-react';
import {MyForm} from "@/components/form/MyForm";

export default function Dashboard() {
    // const data = [
    //     {
    //         id: "1",
    //         name: "Item 1",
    //         category: "Categoria 1",
    //         status: "Ativo",
    //         priority: "Alta",
    //         createdAt: "2024-01-01",
    //     },
    //     {
    //         id: "2",
    //         name: "Item 2",
    //         category: "Categoria 2",
    //         status: "Pendente",
    //         priority: "Média",
    //         createdAt: "2024-01-02",
    //     },
    //     // Add more items as needed
    // ]
     return (
            <div className="min-h-screen bg-transparent backdrop-blur-sm p-4 md:p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <Card className="bg-white/80 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center space-x-4">
                                <User className="w-8 h-8 text-blue-500"/>
                                <div>
                                    <CardTitle className="text-xl text-blue-500">Bem-vindo</CardTitle>
                                    <p className="text-sm text-gray-500">ID do Paciente: 21551</p>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p>Bem-vindo ao portal do paciente Thérapie Fertility!</p>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600">Para iniciar sua jornada conosco:</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-center text-sm text-gray-600">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                            Revise a seção de Informações Pessoais
                                        </li>
                                        <li className="flex items-center text-sm text-gray-600">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                            Assine o Termo de Cuidados
                                        </li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/80 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center space-x-4">
                                <FileText className="w-8 h-8 text-orange-400"/>
                                <CardTitle className="text-xl text-orange-400">Notícias da Clínica</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <p className="font-semibold">AVISO:</p>
                                    <p className="text-sm text-gray-600">
                                        Todos os Exames de Monitoramento e Avaliação serão realizados em nossa clínica
                                        no
                                        andar térreo.
                                    </p>
                                    <p className="text-sm text-gray-600 font-medium">
                                        A entrada de acesso separada está à direita da entrada principal da clínica.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/80 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center space-x-4">
                                <Bell className="w-8 h-8 text-rose-400"/>
                                <CardTitle className="text-xl text-rose-400">Lembretes de Medicamentos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">Você não tem lembretes.</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/80 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center space-x-4">
                                <Calendar className="w-8 h-8 text-green-400"/>
                                <CardTitle className="text-xl text-green-400">Próxima Consulta</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">Você não tem consultas agendadas.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <MyForm />
            </div>
        );
    }

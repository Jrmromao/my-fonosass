'use client'
import React, { useState, useEffect } from 'react';
import {
    Search,
    Calendar,
    Users,
    Clock,
    PlusCircle,
    ChevronRight,
    BarChart2,
    ListFilter,
    LayoutGrid,
    CheckCircle,
    AlertCircle,
    ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,

    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');

    // Mock data for patients
    const patients = [
        {
            id: 'p1',
            name: 'Maria Silva',
            age: 6,
            nextSession: '2025-04-09T14:30:00',
            progress: 68,
            phonemes: ['R', 'S'],
            status: 'active'
        },
        {
            id: 'p2',
            name: 'Pedro Santos',
            age: 8,
            nextSession: '2025-04-10T15:00:00',
            progress: 42,
            phonemes: ['L', 'TH'],
            status: 'active'
        },
        {
            id: 'p3',
            name: 'Ana Oliveira',
            age: 5,
            nextSession: '2025-04-08T10:15:00',
            progress: 91,
            phonemes: ['CH', 'SH'],
            status: 'active'
        },
        {
            id: 'p4',
            name: 'Lucas Costa',
            age: 7,
            nextSession: '2025-04-12T16:45:00',
            progress: 35,
            phonemes: ['F', 'V'],
            status: 'active'
        }
    ];

    // Mock data for upcoming sessions
    const upcomingSessions = [
        {
            id: 's1',
            patientId: 'p1',
            patientName: 'Maria Silva',
            date: '2025-04-09T14:30:00',
            focus: 'R sound in medial position',
            duration: 45
        },
        {
            id: 's2',
            patientId: 'p2',
            patientName: 'Pedro Santos',
            date: '2025-04-10T15:00:00',
            focus: 'L blends in words',
            duration: 30
        },
        {
            id: 's3',
            patientId: 'p3',
            patientName: 'Ana Oliveira',
            date: '2025-04-08T10:15:00',
            focus: 'CH/SH discrimination',
            duration: 45
        }
    ];

    // Mock treatment plans data
    const treatmentPlans = [
        {
            id: 'tp1',
            patientId: 'p1',
            patientName: 'Maria Silva',
            createdAt: '2025-03-15',
            targetPhonemes: ['R', 'S'],
            status: 'in-progress',
            completedSessions: 8,
            totalSessions: 12
        },
        {
            id: 'tp2',
            patientId: 'p2',
            patientName: 'Pedro Santos',
            createdAt: '2025-03-22',
            targetPhonemes: ['L', 'TH'],
            status: 'in-progress',
            completedSessions: 4,
            totalSessions: 10
        },
        {
            id: 'tp3',
            patientId: 'p3',
            patientName: 'Ana Oliveira',
            createdAt: '2025-02-10',
            targetPhonemes: ['CH', 'SH'],
            status: 'completed',
            completedSessions: 14,
            totalSessions: 14
        },
        {
            id: 'tp4',
            patientId: 'p4',
            patientName: 'Lucas Costa',
            createdAt: '2025-04-01',
            targetPhonemes: ['F', 'V'],
            status: 'in-progress',
            completedSessions: 2,
            totalSessions: 8
        }
    ];

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="h-full p-6 bg-gray-50 dark:bg-gray-900">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie seus pacientes e planejamentos
                    </p>
                </div>

                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input placeholder="Buscar paciente..." className="pl-9" />
                    </div>
                    <Button variant="default" className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" />
                        <span>Novo Paciente</span>
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="bg-white dark:bg-gray-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-muted-foreground">Pacientes Ativos</p>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">12</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-muted-foreground">Sessões Hoje</p>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">4</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-muted-foreground">Planos Ativos</p>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">8</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                                <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-muted-foreground">Necessitam Atenção</p>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">3</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="w-full sm:w-auto grid grid-cols-3 md:grid-cols-3 sm:inline-flex">
                    <TabsTrigger value="overview" className="px-4 py-2">
                        Visão Geral
                    </TabsTrigger>
                    <TabsTrigger value="patients" className="px-4 py-2">
                        Pacientes
                    </TabsTrigger>
                    <TabsTrigger value="planning" className="px-4 py-2">
                        Planejamento
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Today's Sessions */}
                        <Card className="lg:col-span-2 bg-white dark:bg-gray-800">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-semibold">Próximas Sessões</CardTitle>
                                    <Button variant="ghost" size="sm" className="text-sm text-muted-foreground">
                                        Ver todas <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {upcomingSessions.map((session) => (
                                        <div key={session.id} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarFallback className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400">
                                                        {session.patientName.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{session.patientName}</p>
                                                    <p className="text-sm text-muted-foreground">{session.focus}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(session.date)}</span>
                                                <span className="text-xs text-muted-foreground">{session.duration} min</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0">
                                <Button variant="outline" className="w-full">Agendar Nova Sessão</Button>
                            </CardFooter>
                        </Card>

                        {/* Treatment Plan Summary */}
                        <Card className="bg-white dark:bg-gray-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-semibold">Planos de Tratamento</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-medium text-muted-foreground">Em Progresso</p>
                                            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">8</span>
                                        </div>
                                        <Progress value={67} className="h-2 bg-gray-100 dark:bg-gray-700" />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-medium text-muted-foreground">Completados</p>
                                            <span className="text-sm font-medium text-green-600 dark:text-green-400">4</span>
                                        </div>
                                        <Progress value={33} className="h-2 bg-gray-100 dark:bg-gray-700" />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-medium text-muted-foreground">Não Iniciados</p>
                                            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">2</span>
                                        </div>
                                        <Progress value={17} className="h-2 bg-gray-100 dark:bg-gray-700" />
                                    </div>
                                </div>

                                <div className="mt-6 space-y-3">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Fonemas mais trabalhados</p>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="secondary" className="bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400">R (8)</Badge>
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">S (6)</Badge>
                                        <Badge variant="secondary" className="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">L (5)</Badge>
                                        <Badge variant="secondary" className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400">CH (4)</Badge>
                                        <Badge variant="secondary" className="bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400">TH (3)</Badge>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0">
                                <Button variant="outline" className="w-full">Ver Relatório Completo</Button>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Patient Progress */}
                    <Card className="bg-white dark:bg-gray-800">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold">Progresso dos Pacientes</CardTitle>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <ListFilter className="h-4 w-4 mr-1" />
                                            Filtrar
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Mostrar por</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>Todos os Pacientes</DropdownMenuItem>
                                        <DropdownMenuItem>Maior Progresso</DropdownMenuItem>
                                        <DropdownMenuItem>Menor Progresso</DropdownMenuItem>
                                        <DropdownMenuItem>Sessões Recentes</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {patients.map((patient) => (
                                    <div key={patient.id} className="flex items-center space-x-4">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400">
                                                {patient.name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{patient.name}</p>
                                                <span className="text-xs font-medium text-muted-foreground">{patient.progress}%</span>
                                            </div>
                                            <Progress value={patient.progress} className="h-2 bg-gray-100 dark:bg-gray-700" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Patients Tab */}
                <TabsContent value="patients" className="space-y-6">
                    <Card className="bg-white dark:bg-gray-800">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold">Meus Pacientes</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm">
                                        <ListFilter className="h-4 w-4 mr-1" />
                                        Filtrar
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                        <LayoutGrid className="h-4 w-4 mr-1" />
                                        Visualização
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {patients.map((patient) => (
                                    <div key={patient.id} className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-12 w-12">
                                                <AvatarFallback className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400">
                                                    {patient.name.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-medium text-gray-900 dark:text-white">{patient.name}</h3>
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <span className="mr-3">{patient.age} anos</span>
                                                    <div className="flex items-center">
                                                        <span>Fonemas: </span>
                                                        <div className="flex ml-1">
                                                            {patient.phonemes.map((phoneme, idx) => (
                                                                <Badge key={idx} variant="outline" className="ml-1 text-xs">
                                                                    {phoneme}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right mr-4">
                                                <p className="text-xs text-muted-foreground">Próxima Sessão</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(patient.nextSession)}</p>
                                            </div>
                                            <Button size="sm" className="flex items-center gap-1">
                                                Detalhes
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                            <Button variant="outline" className="w-full">
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Adicionar Novo Paciente
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Planning Tab */}
                <TabsContent value="planning" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Treatment Plans */}
                        <Card className="lg:col-span-2 bg-white dark:bg-gray-800">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-semibold">Planos de Tratamento</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <ListFilter className="h-4 w-4 mr-1" />
                                                    Filtrar
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Filtrar por status</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>Todos</DropdownMenuItem>
                                                <DropdownMenuItem>Em Progresso</DropdownMenuItem>
                                                <DropdownMenuItem>Completados</DropdownMenuItem>
                                                <DropdownMenuItem>Não Iniciados</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {treatmentPlans.map((plan) => (
                                        <div key={plan.id} className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarFallback className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400">
                                                            {plan.patientName.split(' ').map(n => n[0]).join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h3 className="font-medium text-gray-900 dark:text-white">{plan.patientName}</h3>
                                                        <p className="text-xs text-muted-foreground">Criado em {new Date(plan.createdAt).toLocaleDateString('pt-BR')}</p>
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        plan.status === 'completed'
                                                            ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                                                            : 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400'
                                                    }
                                                >
                                                    {plan.status === 'completed' ? 'Completado' : 'Em progresso'}
                                                </Badge>
                                            </div>

                                            <div className="mb-3">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs text-muted-foreground">Progresso</span>
                                                    <span className="text-xs font-medium">
                            {plan.completedSessions}/{plan.totalSessions} sessões
                          </span>
                                                </div>
                                                <Progress
                                                    value={(plan.completedSessions / plan.totalSessions) * 100}
                                                    className="h-2 bg-gray-100 dark:bg-gray-700"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-xs text-muted-foreground mr-2">Fonemas:</span>
                                                    {plan.targetPhonemes.map((phoneme, idx) => (
                                                        <Badge key={idx} variant="outline" className="mr-1">
                                                            {phoneme}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <Button size="sm" variant="ghost" className="text-purple-600 dark:text-purple-400">
                                                    Ver detalhes
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0">
                                <Button className="w-full">
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Criar Novo Plano
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* AI Assistant & Quick Actions */}
                        <div className="space-y-6">
                            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-100 dark:border-purple-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold text-purple-900 dark:text-purple-100">Assistente IA</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
                                        Gere planos de tratamento personalizados e receba sugestões de atividades com a ajuda da IA.
                                    </p>
                                    <div className="space-y-3">
                                        <Button variant="secondary" className="w-full justify-start">
                                            <PlusCircle className="h-4 w-4 mr-2" />
                                            Plano de tratamento para R
                                        </Button>
                                        <Button variant="secondary" className="w-full justify-start">
                                            <PlusCircle className="h-4 w-4 mr-2" />
                                            Atividades para fonema S
                                        </Button>
                                        <Button variant="secondary" className="w-full justify-start">
                                            <PlusCircle className="h-4 w-4 mr-2" />
                                            Sugestão para sessão
                                        </Button>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                                        Abrir Assistente
                                    </Button>
                                </CardFooter>
                            </Card>

                            <Card className="bg-white dark:bg-gray-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold">Ações Rápidas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <Button variant="outline" className="w-full justify-start">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Agendar Nova Sessão
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start">
                                            <BarChart2 className="h-4 w-4 mr-2" />
                                            Relatório de Progresso
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start">
                                            <Users className="h-4 w-4 mr-2" />
                                            Adicionar Paciente
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <Card className="bg-white dark:bg-gray-800">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold">Atividades Recentes</CardTitle>
                                <Button variant="ghost" size="sm" className="text-sm text-muted-foreground">
                                    Ver todas <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mt-1">
                                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-gray-900 dark:text-white">Plano de tratamento atualizado</p>
                                            <span className="text-xs text-muted-foreground">Hoje, 14:30</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">Plano para Maria Silva atualizado com novos exercícios para fonema R</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mt-1">
                                        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-gray-900 dark:text-white">Sessão agendada</p>
                                            <span className="text-xs text-muted-foreground">Hoje, 10:15</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">Nova sessão agendada com Pedro Santos para amanhã às 15:00</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mt-1">
                                        <BarChart2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-gray-900 dark:text-white">Progresso registrado</p>
                                            <span className="text-xs text-muted-foreground">Ontem, 16:45</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">Ana Oliveira completou sessão com 90% de acertos nos exercícios</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mt-1">
                                        <PlusCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-gray-900 dark:text-white">Novo plano criado</p>
                                            <span className="text-xs text-muted-foreground">05/04, 09:20</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">Plano de tratamento criado para Lucas Costa com foco nos fonemas F e V</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                            <Button variant="outline" className="w-full">Ver Histórico Completo</Button>
                        </CardFooter>
                    </Card>

                    {/* Exercise Plans */}
                    <Card className="bg-white dark:bg-gray-800">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold">Exercícios Recomendados</CardTitle>
                                <Button variant="ghost" size="sm" className="text-sm text-muted-foreground">
                                    Biblioteca de Exercícios <ArrowRight className="ml-1 h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                    <Badge className="mb-2 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400">Fonema R</Badge>
                                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">Jogo das Rimas</h3>
                                    <p className="text-sm text-muted-foreground mb-3">Atividade para praticar palavras com R em posição inicial</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">5-7 anos</span>
                                        <Button size="sm" variant="ghost">Adicionar</Button>
                                    </div>
                                </div>

                                <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                    <Badge className="mb-2 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">Fonema S</Badge>
                                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">Caça ao Tesouro</h3>
                                    <p className="text-sm text-muted-foreground mb-3">Identificação de objetos com som S em posição medial</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">4-6 anos</span>
                                        <Button size="sm" variant="ghost">Adicionar</Button>
                                    </div>
                                </div>

                                <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                    <Badge className="mb-2 bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">Fonema L</Badge>
                                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">História Interativa</h3>
                                    <p className="text-sm text-muted-foreground mb-3">Narrativa com foco em palavras com L em posição inicial</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">6-8 anos</span>
                                        <Button size="sm" variant="ghost">Adicionar</Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Dashboard;
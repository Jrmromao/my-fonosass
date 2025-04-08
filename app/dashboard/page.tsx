'use client'
import React, {useState} from 'react';
import {
    AlertCircle,
    ArrowRight,
    BarChart2,
    Calendar,
    CheckCircle,
    ChevronRight,
    LayoutGrid,
    ListFilter,
    PlusCircle,
    Search,
    Sparkles,
    Users
} from 'lucide-react';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Input} from '@/components/ui/input';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
import {useRouter} from "next/navigation";
import {CustomButton} from "@/app/dashboard/customButton";

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

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

    // Format date to a more readable format using the utils function
    const formatSessionDate = (dateString: string) => {
        const { dateTime } = formatDateTime(new Date(dateString), {
            locale: 'pt-BR',
            includeTime: true,
            use24HourFormat: true
        });
        return dateTime;
    };

    return (
        <div className="h-full bg-gray-50 dark:bg-gray-950">
            {/* Dashboard Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="py-6 px-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-teal-400">
                                FonoSaaS
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Gerencie seus pacientes e planejamentos terapêuticos
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            {/*<Button className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200">*/}
                            {/*    <PlusCircle className="h-4 w-4" />*/}
                            {/*    <span>Novo Paciente</span>*/}
                            {/*</Button>*/}
                            <CustomButton
                                variant="gradient"
                                leftIcon={<PlusCircle className="h-4 w-4" />}
                            >
                                Novo Paciente
                            </CustomButton>
                        </div>
                    </div>

                    {/*<div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mt-4">*/}
                    {/*     Search */}
                    {/*    <div className="relative flex-1 w-full sm:max-w-md">*/}
                    {/*        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />*/}
                    {/*        <Input*/}
                    {/*            placeholder="Buscar pacientes..."*/}
                    {/*            className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"*/}
                    {/*            value={searchTerm}*/}
                    {/*            onChange={(e) => setSearchTerm(e.target.value)}*/}
                    {/*        />*/}
                    {/*    </div>*/}

                    {/*     Filters */}
                    {/*    <div className="flex items-center gap-2 self-end sm:self-auto">*/}
                    {/*        <DropdownMenu>*/}
                    {/*            <DropdownMenuTrigger asChild>*/}
                    {/*                <CustomButton*/}
                    {/*                    variant="outline"*/}
                    {/*                    leftIcon={<ListFilter className="h-4 w-4" />}*/}
                    {/*                >*/}
                    {/*                    <span className="hidden sm:inline">Filtros</span>*/}
                    {/*                </CustomButton>*/}
                    {/*            </DropdownMenuTrigger>*/}
                    {/*            <DropdownMenuContent align="end">*/}
                    {/*                <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>*/}
                    {/*                <DropdownMenuSeparator />*/}
                    {/*                <DropdownMenuItem>Todos os Pacientes</DropdownMenuItem>*/}
                    {/*                <DropdownMenuItem>Sessões de Hoje</DropdownMenuItem>*/}
                    {/*                <DropdownMenuItem>Planos Ativos</DropdownMenuItem>*/}
                    {/*                <DropdownMenuItem>Recém Adicionados</DropdownMenuItem>*/}
                    {/*            </DropdownMenuContent>*/}
                    {/*        </DropdownMenu>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
                <Card className="overflow-hidden border-0 shadow-md">
                    <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                    <CardContent className="p-6 bg-white dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pacientes Ativos</p>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">12</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-0 shadow-md">
                    <div className="h-1 bg-gradient-to-r from-teal-500 to-teal-600"></div>
                    <CardContent className="p-6 bg-white dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center shadow-lg">
                                <Calendar className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sessões Hoje</p>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">4</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-0 shadow-md">
                    <div className="h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
                    <CardContent className="p-6 bg-white dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                                <CheckCircle className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Planos Ativos</p>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">8</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-0 shadow-md">
                    <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-600"></div>
                    <CardContent className="p-6 bg-white dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                                <AlertCircle className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Necessitam Atenção</p>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">3</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <div className="px-6 pb-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="w-full sm:w-auto grid grid-cols-3 md:grid-cols-3 sm:inline-flex bg-gradient-to-r from-gray-100 to-blue-50 dark:from-gray-800 dark:to-blue-900/30 p-1 rounded-lg">
                        <TabsTrigger
                            value="overview"
                            className="px-4 py-2 transition-all duration-200 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm"
                        >
                            Visão Geral
                        </TabsTrigger>
                        <TabsTrigger
                            value="patients"
                            className="px-4 py-2 transition-all duration-200 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm"
                        >
                            Pacientes
                        </TabsTrigger>
                        <TabsTrigger
                            value="planning"
                            className="px-4 py-2 transition-all duration-200 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm"
                        >
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
                                        <Button variant="ghost" size="sm" className="text-sm text-blue-600 dark:text-blue-400">
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
                                                        <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                                                            {session.patientName.split(' ').map(n => n[0]).join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{session.patientName}</p>
                                                        <p className="text-sm text-muted-foreground">{session.focus}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{formatSessionDate(session.date)}</span>
                                                    <span className="text-xs text-muted-foreground">{session.duration} min</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <Button variant="outline" className="w-full hover:bg-blue-50 dark:hover:bg-blue-900">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Agendar Nova Sessão
                                    </Button>
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
                                                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">8</span>
                                            </div>
                                            <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                                                    style={{ width: "67%" }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-sm font-medium text-muted-foreground">Completados</p>
                                                <span className="text-sm font-medium text-green-600 dark:text-green-400">4</span>
                                            </div>
                                            <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                                                    style={{ width: "33%" }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-sm font-medium text-muted-foreground">Não Iniciados</p>
                                                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">2</span>
                                            </div>
                                            <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                                                    style={{ width: "17%" }}
                                                ></div>
                                            </div>
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
                                    <Button variant="outline" className="w-full hover:bg-blue-50 dark:hover:bg-blue-900">
                                        <BarChart2 className="h-4 w-4 mr-2" />
                                        Ver Relatório Completo
                                    </Button>
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
                                            <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400">
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
                                                <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                                                    {patient.name.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{patient.name}</p>
                                                    <span className="text-xs font-medium text-muted-foreground">{patient.progress}%</span>
                                                </div>
                                                <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${
                                                            patient.progress > 70
                                                                ? "bg-gradient-to-r from-green-400 to-teal-500"
                                                                : patient.progress > 40
                                                                    ? "bg-gradient-to-r from-blue-400 to-indigo-500"
                                                                    : "bg-gradient-to-r from-amber-400 to-orange-500"
                                                        }`}
                                                        style={{ width: `${patient.progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Exercise Recommendations */}
                        <Card className="bg-white dark:bg-gray-800">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-semibold">Exercícios Recomendados</CardTitle>
                                    <Button variant="ghost" size="sm" className="text-sm text-blue-600 dark:text-blue-400" onClick={() => router.push('/dashboard/games')}>
                                        Biblioteca de Atividades <ArrowRight className="ml-1 h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                        <Badge className="mb-2 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400">Fonema R</Badge>
                                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">Jogo das Rimas</h3>
                                        <p className="text-sm text-muted-foreground mb-3">Atividade para praticar palavras com R em posição inicial</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">5-7 anos</span>
                                            <Button size="sm" variant="ghost" className="text-blue-600">Adicionar</Button>
                                        </div>
                                    </div>

                                    <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                        <Badge className="mb-2 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">Fonema S</Badge>
                                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">Caça ao Tesouro</h3>
                                        <p className="text-sm text-muted-foreground mb-3">Identificação de objetos com som S em posição medial</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">4-6 anos</span>
                                            <Button size="sm" variant="ghost" className="text-blue-600">Adicionar</Button>
                                        </div>
                                    </div>

                                    <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                        <Badge className="mb-2 bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">Fonema L</Badge>
                                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">História Interativa</h3>
                                        <p className="text-sm text-muted-foreground mb-3">Narrativa com foco em palavras com L em posição inicial</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">6-8 anos</span>
                                            <Button size="sm" variant="ghost" className="text-blue-600">Adicionar</Button>
                                        </div>
                                    </div>
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
                                        <Button variant="ghost" size="sm" className="text-blue-600">
                                            <ListFilter className="h-4 w-4 mr-1" />
                                            Filtrar
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-blue-600">
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
                                                    <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
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
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatSessionDate(patient.nextSession)}</p>
                                                </div>
                                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1">
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
                                                    <Button variant="ghost" size="sm" className="text-blue-600">
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
                                                            <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
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
                                                    <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${
                                                                plan.status === 'completed'
                                                                    ? "bg-gradient-to-r from-green-400 to-green-600"
                                                                    : "bg-gradient-to-r from-blue-400 to-indigo-600"
                                                            }`}
                                                            style={{ width: `${(plan.completedSessions / plan.totalSessions) * 100}%` }}
                                                        ></div>
                                                    </div>
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
                                                    <Button size="sm" variant="ghost" className="text-blue-600 dark:text-blue-400">
                                                        Ver detalhes
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Criar Novo Plano
                                    </Button>
                                </CardFooter>
                            </Card>

                            {/* AI Assistant & Quick Actions */}
                            <div className="space-y-6">
                                <Card className="border-0 shadow-md overflow-hidden">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 via-indigo-600/80 to-teal-600/80"></div>
                                        <div className="absolute inset-0 bg-[url('/api/placeholder/800/400')] opacity-20 mix-blend-overlay"></div>
                                        <CardHeader className="relative pb-2 text-white">
                                            <CardTitle className="text-lg font-semibold flex items-center">
                                                <Sparkles className="h-5 w-5 mr-2" />
                                                Assistente IA
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="relative text-white">
                                            <p className="text-sm mb-4">
                                                Gere planos de tratamento personalizados e receba sugestões de atividades com a ajuda da IA.
                                            </p>
                                            <div className="space-y-3">
                                                <Button variant="secondary" className="w-full justify-start bg-white/20 hover:bg-white/30 text-white border-white/40">
                                                    <PlusCircle className="h-4 w-4 mr-2" />
                                                    Plano de tratamento para R
                                                </Button>
                                                <Button variant="secondary" className="w-full justify-start bg-white/20 hover:bg-white/30 text-white border-white/40">
                                                    <PlusCircle className="h-4 w-4 mr-2" />
                                                    Atividades para fonema S
                                                </Button>
                                                <Button variant="secondary" className="w-full justify-start bg-white/20 hover:bg-white/30 text-white border-white/40">
                                                    <PlusCircle className="h-4 w-4 mr-2" />
                                                    Sugestão para sessão
                                                </Button>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="pt-0 relative">
                                            <Button className="w-full bg-white hover:bg-gray-100 text-blue-700 font-medium">
                                                Abrir Assistente
                                            </Button>
                                        </CardFooter>
                                    </div>
                                </Card>

                                <Card className="bg-white dark:bg-gray-800 overflow-hidden border-0 shadow-md">
                                    <div className="h-1 bg-gradient-to-r from-indigo-500 to-teal-500"></div>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg font-semibold">Ações Rápidas</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <Button variant="outline" className="w-full justify-start group transition-all duration-200 border-blue-100 dark:border-blue-900/50">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 group-hover:bg-blue-500 group-hover:text-white transition-all duration-200">
                                                    <Calendar className="h-4 w-4" />
                                                </div>
                                                Agendar Nova Sessão
                                            </Button>
                                            <Button variant="outline" className="w-full justify-start group transition-all duration-200 border-teal-100 dark:border-teal-900/50">
                                                <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mr-3 group-hover:bg-teal-500 group-hover:text-white transition-all duration-200">
                                                    <BarChart2 className="h-4 w-4" />
                                                </div>
                                                Relatório de Progresso
                                            </Button>
                                            <Button variant="outline" className="w-full justify-start group transition-all duration-200 border-indigo-100 dark:border-indigo-900/50">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-3 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-200">
                                                    <Users className="h-4 w-4" />
                                                </div>
                                                Adicionar Paciente
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Recent Activities */}
                        <Card className="bg-white dark:bg-gray-800 overflow-hidden border-0 shadow-md">
                            <div className="h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-teal-500"></div>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-semibold">Atividades Recentes</CardTitle>
                                    <Button variant="ghost" size="sm" className="text-sm text-blue-600 dark:text-blue-400">
                                        Ver todas <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4 p-3 rounded-lg bg-gradient-to-r from-green-50 to-transparent dark:from-green-900/10 dark:to-transparent hover:bg-green-50/70 dark:hover:bg-green-900/20 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mt-1 shadow-sm">
                                            <CheckCircle className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-gray-900 dark:text-white">Plano de tratamento atualizado</p>
                                                <span className="text-xs text-muted-foreground">Hoje, 14:30</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">Plano para Maria Silva atualizado com novos exercícios para fonema R</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/10 dark:to-transparent hover:bg-blue-50/70 dark:hover:bg-blue-900/20 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mt-1 shadow-sm">
                                            <Calendar className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-gray-900 dark:text-white">Sessão agendada</p>
                                                <span className="text-xs text-muted-foreground">Hoje, 10:15</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">Nova sessão agendada com Pedro Santos para amanhã às 15:00</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-3 rounded-lg bg-gradient-to-r from-teal-50 to-transparent dark:from-teal-900/10 dark:to-transparent hover:bg-teal-50/70 dark:hover:bg-teal-900/20 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mt-1 shadow-sm">
                                            <BarChart2 className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-gray-900 dark:text-white">Progresso registrado</p>
                                                <span className="text-xs text-muted-foreground">Ontem, 16:45</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">Ana Oliveira completou sessão com 90% de acertos nos exercícios</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-900/10 dark:to-transparent hover:bg-amber-50/70 dark:hover:bg-amber-900/20 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mt-1 shadow-sm">
                                            <PlusCircle className="h-5 w-5 text-white" />
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
                                <Button variant="outline" className="w-full hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent dark:hover:from-blue-900/10 dark:hover:to-transparent transition-colors">
                                    Ver Histórico Completo
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Progress Analysis & Adaptive Tech */}
                        <Card className="bg-white dark:bg-gray-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-semibold">Recursos Avançados</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col items-center text-center p-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-3">
                                            <BarChart2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">Análise de Progresso</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Acompanhamento detalhado do desenvolvimento do paciente com métricas e visualizações intuitivas.
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-center text-center p-4">
                                        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mb-3">
                                            <Sparkles className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">Tecnologia Adaptativa</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Exercícios que se ajustam automaticamente ao nível e progresso do paciente para um aprendizado otimizado.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                    Explorar Todos os Recursos
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};
export default Dashboard;




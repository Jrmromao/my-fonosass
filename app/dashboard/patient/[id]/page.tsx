"use client"

import {useEffect, useState} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Activity, Calendar, ChevronLeft, Clock, FileText, MessageSquare, Phone, User2} from 'lucide-react'
import {useRouter} from "next/navigation";
import {useParams} from "next/navigation"
import {getPatientById} from "@/lib/actions/patient.action";

// const sampleHistoryEvents = [
//     {
//         id: '1',
//         type: 'registration',
//         date: '01 Jan 2024',
//         title: 'Registro do Paciente',
//         description: 'Maria Silva foi registrada como nova paciente.'
//     },
//     {
//         id: '2',
//         type: 'appointment',
//         date: '15 Jan 2024',
//         title: 'Primeira Consulta',
//         description: 'Avaliação inicial realizada. Paciente relatou dificuldades na articulação de fonemas sibilantes.'
//     },
//     {
//         id: '3',
//         type: 'diagnosis',
//         date: '22 Jan 2024',
//         title: 'Diagnóstico',
//         description: 'Diagnosticado distúrbio articulatório. Plano de tratamento elaborado.'
//     },
//     {
//         id: '4',
//         type: 'treatment',
//         date: '01 Feb 2024',
//         title: 'Início do Tratamento',
//         description: 'Iniciadas sessões semanais de terapia focadas em exercícios de articulação.'
//     },
//     {
//         id: '5',
//         type: 'note',
//         date: '15 Feb 2024',
//         title: 'Nota de Progresso',
//         description: 'Paciente demonstra melhora na pronúncia de "s" e "z". Continuar com exercícios atuais.'
//     },
// ]

export default function Page() {

    interface PatientDetails {
        id: string
        firstName: string
        lastName: string
        fullName: string
        dateOfBirth: string // Changed from Date to string
        gender: string | null
        contactPhone: string | null
        contactEmail: string | null
        address: string | null
        medicalHistory: string | null
        status: "ACTIVE" | "INACTIVE"
        primaryTherapist: {
            id: string
            fullName: string
            email: string
        }
        progressNotes: Array<{
            id: string
            content: string
            createdAt: string // Changed from Date to string
        }>
        activities: Array<{
            id: string
            activity: {
                name: string
                type: string
            }
            status: string
        }>
    }


    const [activeTab, setActiveTab] = useState("overview")
    const router = useRouter()
    const params = useParams()
    const [patient, setPatient] = useState<PatientDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadPatient() {
            try {
                if (!params.id) return

                const response = await getPatientById(params.id as string)

                if (response.success) {
                    console.log(response)
                    // setPatient({
                    //     activities: [],
                    //     progressNotes: [],
                    //     primaryTherapist: {
                    //         email: response?.data?.primaryTherapist.email!,
                    //         fullName: response?.data?.primaryTherapist.fullName!,
                    //         id: response?.data?.primaryTherapist.id!
                    //     },
                    //     status: response?.data?.status!,
                    //     medicalHistory: response.data?.medicalHistory!,
                    //     address: response.data?.address!,
                    //     contactEmail: response.data?.contactEmail!,
                    //     contactPhone: response.data?.contactPhone!,
                    //     dateOfBirth: response.data?.dateOfBirth!,
                    //     firstName: response.data?.firstName!,
                    //     gender: response.data?.gender!,
                    //     id: response.data?.id!,
                    //     lastName: response.data?.lastName!,
                    //     fullName: response.data?.fullName!
                    // })
                } else {

                }
            } catch (err) {
                setError('Failed to load patient data')
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }

        loadPatient()
    }, [params.id])

    return (
        <div className="h-full p-8 bg-white">
            <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
                <ChevronLeft className="w-4 h-4 mr-2"/>
                Voltar para lista
            </Button>

            <div className="flex gap-6">
                <div className="w-2/3">
                    <div className="flex items-start gap-6 mb-6">
                        <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center">
                            <User2 className="w-12 h-12 text-purple-600"/>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                                {patient?.fullName}
                            </h1>
                            <div className="text-muted-foreground mt-1">ID: #{patient?.id}</div>
                            <div className="flex gap-4 mt-4">
                                <Button variant="outline" size="sm">
                                    <Phone className="w-4 h-4 mr-2"/>
                                    Ligar
                                </Button>
                                <Button variant="outline" size="sm">
                                    <MessageSquare className="w-4 h-4 mr-2"/>
                                    Mensagem
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList>
                            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                            <TabsTrigger value="history">Histórico</TabsTrigger>
                            <TabsTrigger value="documents">Documentos</TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">
                                            Próxima Consulta
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-purple-600"/>
                                            15 Dec 2024
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock className="w-4 h-4 text-purple-600"/>
                                            14:30
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">
                                            Status do Tratamento
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-green-600"/>
                                            Em Progresso
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-1">
                                            8 de 12 sessões realizadas
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Anotações Recentes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {Array.from({length: 3}).map((_, i) => (
                                            <div key={i} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                                                <div
                                                    className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                                                    <FileText className="w-4 h-4 text-purple-600"/>
                                                </div>
                                                <div>
                                                    <div className="font-medium">Sessão de Terapia #{8 - i}</div>
                                                    <div className="text-sm text-muted-foreground mt-1">
                                                        Paciente demonstrou progresso significativo na articulação de
                                                        fonemas complexos...
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-2">
                                                        01 Dec 2024
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="history">
                            {/*<PatientHistoryFeed events={sampleHistoryEvents}/>*/}
                        </TabsContent>
                        <TabsContent value="documents">
                            {/* Documents content */}
                        </TabsContent>
                    </Tabs>
                </div>

                <Card className="w-1/3">
                    <CardHeader>
                        <CardTitle>Informações do Paciente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Email</div>
                                <div>{patient?.contactEmail}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Telefone</div>
                                <div>{patient?.contactPhone}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Data de Nascimento</div>
                                <div>{patient?.dateOfBirth}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Endereço</div>
                                <div>{patient?.address}</div>
                                <div>São Paulo - SP</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Plano de Saúde</div>
                                <div>Unimed</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}


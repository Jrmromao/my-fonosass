import { Activity, Calendar, ClipboardList, PenTool, Stethoscope, UserPlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface HistoryEvent {
    id: string
    type: 'registration' | 'appointment' | 'diagnosis' | 'treatment' | 'note'
    date: string
    title: string
    description: string
}

interface PatientHistoryFeedProps {
    events: HistoryEvent[]
}

const getEventIcon = (type: HistoryEvent['type']) => {
    switch (type) {
        case 'registration':
            return <UserPlus className="w-4 h-4 text-purple-600" />
        case 'appointment':
            return <Calendar className="w-4 h-4 text-blue-600" />
        case 'diagnosis':
            return <Stethoscope className="w-4 h-4 text-green-600" />
        case 'treatment':
            return <Activity className="w-4 h-4 text-orange-600" />
        case 'note':
            return <PenTool className="w-4 h-4 text-yellow-600" />
        default:
            return <ClipboardList className="w-4 h-4 text-gray-600" />
    }
}

export function PatientHistoryFeed({ events }: PatientHistoryFeedProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Histórico do Paciente</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {events.map((event, index) => (
                        <div key={event.id} className="relative pl-8 pb-8">
                            {index !== events.length - 1 && (
                                <div className="absolute left-4 top-4 -bottom-4 w-px bg-gray-200" />
                            )}
                            <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                {getEventIcon(event.type)}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-muted-foreground">{event.date}</span>
                                <span className="font-medium">{event.title}</span>
                                <p className="mt-1 text-sm text-gray-600">{event.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

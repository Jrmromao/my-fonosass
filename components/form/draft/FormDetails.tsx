import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface FormDetailsProps {
    title: string
    description: string
    setTitle: (title: string) => void
    setDescription: (description: string) => void
}

export function FormDetails({ title, description, setTitle, setDescription }: FormDetailsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Criar Formulário</CardTitle>
                <CardDescription>
                    Preencha os campos abaixo para criar um novo formulário
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                        id="title"
                        placeholder="Enter form title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Descrição do Formulário </Label>
                    <Textarea
                        id="description"
                        placeholder="Descreva o proposito deste formulario"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
// components/dialogs/new-activity-dialog.tsx
"use client"

import {useState} from "react"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import * as z from "zod"
import {Button} from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {Form} from "@/components/ui/form"
import {Plus, Upload} from 'lucide-react'
import {toast} from "@/hooks/use-toast"
import {LoadingOverlay} from "@/components/LoadingOverlay"
import {CustomInput} from "@/components/form/CustomInput"
import {CustomSelect} from "@/components/form/CustomSelect"
import {CustomTextarea} from "@/components/form/CustomTextarea"
import {Dropzone} from "@/components/Dropzone";
import {createActivity} from "@/lib/actions/activity.action";

const activitySchema = z.object({
    name: z.string().min(2, "Nome é obrigatório"),
    description: z.string().min(10, "Descrição é obrigatória"),
    type: z.enum(["SPEECH", "LANGUAGE", "COGNITIVE", "MOTOR", "SOCIAL", "OTHER"]),
    difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
    ageRange: z.enum(["TODDLER", "PRESCHOOL", "CHILD", "TEENAGER", "ADULT"]),
    // isPublic: z.boolean().default(false),
    files: z.array(z.instanceof(File)).optional()
})

const typeOptions = [
    {value: "SPEECH", label: "Fala"},
    {value: "LANGUAGE", label: "Linguagem"},
    {value: "COGNITIVE", label: "Cognitivo"},
    {value: "MOTOR", label: "Motor"},
    {value: "SOCIAL", label: "Social"},
    {value: "OTHER", label: "Outro"}
]

const difficultyOptions = [
    {value: "BEGINNER", label: "Iniciante"},
    {value: "INTERMEDIATE", label: "Intermediário"},
    {value: "ADVANCED", label: "Avançado"},
    {value: "EXPERT", label: "Especialista"}
]

const ageRangeOptions = [
    {value: "TODDLER", label: "1-3 anos"},
    {value: "PRESCHOOL", label: "3-5 anos"},
    {value: "CHILD", label: "5-12 anos"},
    {value: "TEENAGER", label: "12-18 anos"},
    {value: "ADULT", label: "18+ anos"}
]

export function NewActivityDialog() {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [files, setFiles] = useState<File[]>([])

    const form = useForm<z.infer<typeof activitySchema>>({
        resolver: zodResolver(activitySchema),
        defaultValues: {
            name: "",
            description: "",
            files: []
        }
    })

    const handleFilesAdded = (files: File[]) => {
        form.setValue('files', files)
    }

    async function onSubmit(values: z.infer<typeof activitySchema>) {
        setIsSubmitting(true)
        try {
            // Add your activity creation logic here
            await createActivity({
                name: values.name,
                description: values.description,
                // type: values.type,
                // difficulty: values.difficulty,
                // ageRange: values.ageRange,
                files: values.files,
                isPublic: false
            }).then(_ => {
                toast({
                    title: "Atividade criada com sucesso!",
                    description: "A nova atividade foi salva.",
                })
                form.reset()
                setOpen(false)
            })

        } catch (error) {
            toast({
                title: "Erro ao criar atividade",
                description: "Ocorreu um erro ao salvar os dados.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2"/>
                    Nova Atividade
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                {isSubmitting && <LoadingOverlay/>}
                <DialogHeader>
                    <DialogTitle>Criar Nova Atividade</DialogTitle>
                    <DialogDescription>
                        Preencha os dados da nova atividade. Clique em salvar quando terminar.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <CustomInput
                            control={form.control}
                            name="name"
                            label="Nome"
                            placeholder="Nome da atividade"
                            required
                        />

                        <CustomTextarea
                            control={form.control}
                            name="description"
                            label="Descrição"
                            placeholder="Descreva a atividade"
                            required
                        />

                        <CustomSelect
                            control={form.control}
                            name="type"
                            label="Tipo"
                            placeholder="Selecione o tipo"
                            options={typeOptions}
                            required
                        />

                        <CustomSelect
                            control={form.control}
                            name="difficulty"
                            label="Dificuldade"
                            placeholder="Selecione a dificuldade"
                            options={difficultyOptions}
                            required
                        />

                        <CustomSelect
                            control={form.control}
                            name="ageRange"
                            label="Faixa Etária"
                            placeholder="Selecione a faixa etária"
                            options={ageRangeOptions}
                            required
                        />

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Arquivos
                            </label>
                            <Dropzone
                                onFilesAdded={handleFilesAdded}
                                maxFiles={5}
                                maxSize={5 * 1024 * 1024} // 5MB
                                accept={{
                                    'application/pdf': ['.pdf'],
                                }}
                            />
                            <p className="text-xs text-muted-foreground">
                                Aceita PDF até 5MB
                            </p>
                        </div>
                    </form>
                </Form>
                <DialogFooter className="flex justify-end space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setOpen(false)
                            form.reset()
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        onClick={form.handleSubmit(onSubmit)}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="mr-2">Criando</span>
                                <span className="animate-pulse">...</span>
                            </>
                        ) : (
                            "Criar Atividade"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
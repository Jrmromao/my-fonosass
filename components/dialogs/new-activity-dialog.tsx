"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { Plus } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import { LoadingOverlay } from "@/components/LoadingOverlay"
import { CustomInput } from "@/components/form/CustomInput"
import { CustomTextarea } from "@/components/form/CustomTextarea"
import { Dropzone } from "@/components/Dropzone"
import { createActivity } from "@/lib/actions/activity.action"

// Form schema (client-side only)
const activitySchema = z.object({
    name: z.string().min(2, "Nome é obrigatório"),
    description: z.string().min(10, "Descrição é obrigatória"),
    files: z.array(z.instanceof(File)).optional()
})

type FormValues = z.infer<typeof activitySchema>

export function NewActivityDialog() {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<FormValues>({
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

    async function onSubmit(values: FormValues) {
        setIsSubmitting(true);

        try {
            // Create a FormData object for safer file handling
            const formData = new FormData();
            formData.append("name", values.name.trim());
            formData.append("description", values.description.trim());
            formData.append("type", "OTHER");
            formData.append("difficulty", "BEGINNER");
            formData.append("ageRange", "TODDLER");
            formData.append("isPublic", "true");

            // Add files to FormData
            if (values.files && values.files.length > 0) {
                values.files.forEach((file, index) => {
                    formData.append(`file-${index}`, file);
                });
            }

            // Log the keys being sent in FormData
            console.log("Submitting form data with keys:", Array.from(formData.keys()));

            const result = await createActivity(formData);

            if (result.success) {
                toast({
                    title: "Atividade criada com sucesso!",
                    description: "A nova atividade foi salva.",
                });
                form.reset();
                setOpen(false);
            } else {
                throw new Error(result.error || "Erro ao criar atividade");
            }
        } catch (error) {
            console.error("Error creating activity:", error);
            toast({
                title: "Erro ao criar atividade",
                description: error instanceof Error ? error.message : "Ocorreu um erro ao salvar os dados.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    const closeAndReset = () => {
        setOpen(false)
        form.reset()
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

                        <DialogFooter className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeAndReset}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
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
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
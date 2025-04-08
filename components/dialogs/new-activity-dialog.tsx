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
import { Plus, Save, X } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import { LoadingOverlay } from "@/components/LoadingOverlay"
import { CustomInput } from "@/components/form/CustomInput"
import { CustomTextarea } from "@/components/form/CustomTextarea"
import { Dropzone } from "@/components/Dropzone"
import { createActivity } from "@/lib/actions/activity.action"
import { CustomSelect } from "@/components/form/CustomSelect"
import phonemes from "@/utils/phonemeList"

// Form schema (client-side only)
const activitySchema = z.object({
    name: z.string().min(2, "Nome é obrigatório"),
    description: z.string().optional(),
    phoneme: z.string().min(1, "Phoneme é obrigatório"),
    files: z.array(z.instanceof(File)).optional()
})

type FormValues = z.infer<typeof activitySchema>

interface NewActivityDialogProps {
    onSuccess?: () => void;
}

export function NewActivityDialog({ onSuccess }: NewActivityDialogProps) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(activitySchema),
        defaultValues: {
            name: "",
            description: "",
            phoneme: "",
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
            formData.append("description", values?.description?.trim() || "");
            formData.append("phoneme", values.phoneme.trim());
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

            const result = await createActivity(formData);

            if (result.success) {
                toast({
                    title: "Atividade criada com sucesso!",
                    description: "A nova atividade foi salva.",
                });

                // Call onSuccess callback if provided
                if (onSuccess) {
                    onSuccess();
                }

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
                <Button className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200">
                    <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} />
                    Nova Atividade
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-0 shadow-xl rounded-xl">
                {isSubmitting && <LoadingOverlay />}
                <DialogHeader className="pb-4 border-b dark:border-gray-800">
                    <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-500">
                        Criar Nova Atividade
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-400 mt-2">
                        Preencha os dados da nova atividade para seu plano de fonoaudiologia.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-2">
                        <CustomInput
                            control={form.control}
                            name="name"
                            label="Nome da Atividade"
                            placeholder="Ex: Exercício de Articulação do R"
                            required
                        />

                        <CustomSelect
                            control={form.control}
                            name="phoneme"
                            label="Fonema Alvo"
                            placeholder="Selecione o fonema trabalhado"
                            options={phonemes}
                            required
                        />

                        <CustomTextarea
                            control={form.control}
                            name="description"
                            label="Descrição da Atividade"
                            placeholder="Descreva o objetivo e como realizar a atividade..."
                            required
                        />

                        <div className="space-y-3 pt-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Materiais de Apoio
                            </label>
                            <Dropzone
                                onFilesAdded={handleFilesAdded}
                                maxFiles={5}
                                maxSize={5 * 1024 * 1024} // 5MB
                                accept={{
                                    'application/pdf': ['.pdf'],
                                }}
                                className="border-2 border-dashed border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 bg-blue-50 dark:bg-blue-900/20"
                            />
                            <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                Aceita arquivos PDF até 5MB
                            </p>
                        </div>

                        <DialogFooter className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800 mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeAndReset}
                                className="border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Criando...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Criar Atividade
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
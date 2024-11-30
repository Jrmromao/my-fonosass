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
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {Textarea} from "@/components/ui/textarea"

import {Plus} from 'lucide-react'
import {createPatient} from "@/lib/actions/activity.action";
import {toast} from "@/hooks/use-toast";
import {LoadingOverlay} from "@/components/LoadingOverlay";

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Nome deve ter pelo menos 2 caracteres.",
    }),
    email: z.string().email({
        message: "Email inválido.",
    }),
    phone: z.string().min(10, {
        message: "Telefone deve ter pelo menos 10 dígitos.",
    }),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "Data de nascimento deve estar no formato YYYY-MM-DD.",
    }),
    address: z.string().min(5, {
        message: "Endereço deve ter pelo menos 5 caracteres.",
    }),
    healthInsurance: z.string().optional(),
    notes: z.string().optional(),
})

export function NewPatientDialog() {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            dateOfBirth: "",
            address: "",
            healthInsurance: "",
            notes: "",
        },
    })



    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        try {
            await createPatient(values)
            toast({
                title: "Paciente cadastrado com sucesso!",
                description: "Os dados do novo paciente foram salvos.",
            })
            form.reset()
            setOpen(false)
        } catch (error) {
            toast({
                title: "Erro ao cadastrar paciente",
                description: "Ocorreu um erro ao salvar os dados. Por favor, tente novamente."+error,
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
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Paciente
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">

                {isSubmitting && <LoadingOverlay />}
                <DialogHeader>
                    <DialogTitle>Cadastrar Novo Paciente</DialogTitle>
                    <DialogDescription>
                        Preencha os dados do novo paciente. Clique em salvar quando terminar.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nome do paciente" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="email@exemplo.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Telefone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="(00) 00000-0000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dateOfBirth"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Data de Nascimento</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormDescription>Formato: YYYY-MM-DD</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Endereço</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Rua, número, bairro, cidade - Estado" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="healthInsurance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Plano de Saúde</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nome do plano de saúde (opcional)" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Observações</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Observações adicionais sobre o paciente (opcional)" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </div>
                <DialogFooter className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>
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
                                <span className="mr-2">Cadastrando</span>
                                <span className="animate-pulse">...</span>
                            </>
                        ) : (
                            "Cadastrar Paciente"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


import React, { useState } from "react"
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
import { toast } from "@/hooks/use-toast"
import { LoadingOverlay } from "@/components/LoadingOverlay"
import { patientSchema } from "@/lib/schema"
import { CustomInput } from "@/components/form/CustomInput"
import { useRouter } from "next/navigation"

interface SignUpDialogProps {
    plan: Plan
}

interface FormDetailsProps {
    name: string
    label: string
    placeholder: string
    required: boolean
    type?: string
}

export function SignUpDialog({ plan }: SignUpDialogProps) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const form = useForm<z.infer<typeof patientSchema>>({
        resolver: zodResolver(patientSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            // professionalId: "",
            // specialty: "",
            // contactEmail: "",
            // contactPhone: "",
            // clinicName: "",
            // password: "",
            // confirmPassword: "",
        },
    })

    const formDetails: FormDetailsProps[] = [
        {
            name: "firstName",
            label: "Nome",
            placeholder: "Seu nome",
            required: true
        },
        {
            name: "lastName",
            label: "Sobrenome",
            placeholder: "Seu sobrenome",
            required: true
        },
        {
            name: "professionalId",
            label: "CRM/CRO/Registro Profissional",
            placeholder: "Seu número de registro",
            required: true
        },
        {
            name: "specialty",
            label: "Especialidade",
            placeholder: "Sua especialidade médica",
            required: true
        },
        {
            name: "clinicName",
            label: "Nome da Clínica",
            placeholder: "Nome do seu consultório ou clínica",
            required: false
        },
        {
            name: "contactEmail",
            label: "Email Profissional",
            placeholder: "seu.email@exemplo.com",
            required: true,
            type: "email"
        },
        {
            name: "contactPhone",
            label: "Telefone",
            placeholder: "(00) 00000-0000",
            required: true
        },
        {
            name: "password",
            label: "Senha",
            placeholder: "Digite sua senha",
            required: true,
            type: "password"
        },
        {
            name: "confirmPassword",
            label: "Confirme sua Senha",
            placeholder: "Digite sua senha novamente",
            required: true,
            type: "password"
        }
    ]

    async function onSubmit(values: z.infer<typeof patientSchema>) {
        setIsSubmitting(true)
        try {
            // const response = await createPatient(values)
            // if (response.success) {
            //     toast({
            //         title: "Conta criada com sucesso!",
            //         description: "Bem-vindo ao nosso sistema. Você será redirecionado para sua área.",
            //     })
            //     form.reset()
            //     router.refresh()
            //     setOpen(false)
            // }
        } catch (error: any) {
            toast({
                title: "Erro ao criar conta",
                description: "Por favor, verifique seus dados e tente novamente.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className={`w-full ${
                        plan.highlight
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50'
                    } transition-all duration-300 text-sm font-medium`}
                >
                    {plan.cta}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
                {isSubmitting && <LoadingOverlay />}
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-indigo-600">
                        Comece sua experiência com o plano {plan.name}
                    </DialogTitle>
                    <DialogDescription className="mt-2 text-gray-600">
                        {plan.trial ? `Aproveite ${plan.trial} de teste gratuito. ` : ''}
                        Complete seu cadastro para começar a otimizar sua gestão de pacientes.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-gray-700">Informações Pessoais</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {formDetails.slice(0, 2).map((detail) => (
                                        <CustomInput
                                            key={detail.name}
                                            control={form.control}
                                            name={detail.name}
                                            label={detail.label}
                                            placeholder={detail.placeholder}
                                            required={detail.required}
                                            type={detail.type}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-gray-700">Informações Profissionais</h3>
                                <div className="space-y-4">
                                    {formDetails.slice(2, 5).map((detail) => (
                                        <CustomInput
                                            key={detail.name}
                                            control={form.control}
                                            name={detail.name}
                                            label={detail.label}
                                            placeholder={detail.placeholder}
                                            required={detail.required}
                                            type={detail.type}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-gray-700">Contato</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {formDetails.slice(5, 7).map((detail) => (
                                        <CustomInput
                                            key={detail.name}
                                            control={form.control}
                                            name={detail.name}
                                            label={detail.label}
                                            placeholder={detail.placeholder}
                                            required={detail.required}
                                            type={detail.type}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-gray-700">Segurança</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {formDetails.slice(7).map((detail) => (
                                        <CustomInput
                                            key={detail.name}
                                            control={form.control}
                                            name={detail.name}
                                            label={detail.label}
                                            placeholder={detail.placeholder}
                                            required={detail.required}
                                            type={detail.type}
                                        />
                                    ))}
                                </div>
                            </div>
                        </form>
                    </Form>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="w-full sm:w-auto"
                    >
                        Voltar
                    </Button>
                    <Button
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className={`w-full sm:w-auto ${
                            plan.highlight
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
                        } transition-all duration-300`}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin">⏳</span>
                                Processando...
                            </span>
                        ) : (
                            `Começar ${plan.trial ? 'Período Gratuito' : 'Agora'}`
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
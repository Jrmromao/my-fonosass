// "use client"
//
// import {useState} from "react"
// import {useForm} from "react-hook-form"
// import {zodResolver} from "@hookform/resolvers/zod"
// import * as z from "zod"
// import {Button} from "@/components/ui/button"
// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogFooter,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
// } from "@/components/ui/dialog"
// import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form"
// import {Input} from "@/components/ui/input"
// import {Textarea} from "@/components/ui/textarea"
//
// import {Plus} from 'lucide-react'
// import {createPatient} from "@/lib/actions/activity.action";
// import {toast} from "@/hooks/use-toast";
// import {LoadingOverlay} from "@/components/LoadingOverlay";
// import {patientSchema} from "@/lib/schema";
// import {CustomInput} from "@/components/form/CustomInput";
// import {PhoneInput} from "@/components/form/PhoneInput";
// import {DateInput} from "@/components/form/DateInput";
// import {CustomTextarea} from "@/components/form/CustomTextarea";
//
// export function NewPatientDialog() {
//     const [open, setOpen] = useState(false)
//     const [isSubmitting, setIsSubmitting] = useState(false)
//
//     const form = useForm<z.infer<typeof patientSchema>>({
//         resolver: zodResolver(patientSchema),
//         defaultValues: {
//             name: "",
//             email: "",
//             phone: "",
//             dateOfBirth: "",
//             address: "",
//             healthInsurance: "",
//             notes: "",
//         },
//     })
//
//
//     async function onSubmit(values: z.infer<typeof patientSchema>) {
//         setIsSubmitting(true)
//         try {
//             await createPatient(values)
//             toast({
//                 title: "Paciente cadastrado com sucesso!",
//                 description: "Os dados do novo paciente foram salvos.",
//             })
//             form.reset()
//             setOpen(false)
//         } catch (error) {
//             toast({
//                 title: "Erro ao cadastrar paciente",
//                 description: "Ocorreu um erro ao salvar os dados. Por favor, tente novamente." + error,
//                 variant: "destructive",
//             })
//         } finally {
//             setIsSubmitting(false)
//         }
//     }
//
//     return (
//         <Dialog open={open} onOpenChange={setOpen}>
//             <DialogTrigger asChild>
//                 <Button className="bg-purple-600 hover:bg-purple-700">
//                     <Plus className="w-4 h-4 mr-2"/>
//                     Novo Paciente
//                 </Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
//
//                 {isSubmitting && <LoadingOverlay/>}
//                 <DialogHeader>
//                     <DialogTitle>Cadastrar Novo Paciente</DialogTitle>
//                     <DialogDescription>
//                         Preencha os dados do novo paciente. Clique em salvar quando terminar.
//                     </DialogDescription>
//                 </DialogHeader>
//                 <div className="py-4">
//                     <Form {...form}>
//                         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                             <CustomInput
//                                 control={form.control}
//                                 name="name"
//                                 label="Nome"
//                                 placeholder="Nome do paciente"
//                                 required
//                             />
//
//                             <CustomInput
//                                 control={form.control}
//                                 name="email"
//                                 label="Tutor Email"
//                                 type="email"
//                                 placeholder="email@exemplo.com"
//                                 required
//                             />
//
//                             <PhoneInput
//                                 control={form.control}
//                                 name="phone"
//                                 required
//                             />
//
//                             <DateInput
//                                 control={form.control}
//                                 name="dateOfBirth"
//                                 label="Data de Nascimento"
//                                 required
//                             />
//
//                             <CustomInput
//                                 control={form.control}
//                                 name="address"
//                                 label="Endereço"
//                                 placeholder="Rua, número, bairro, cidade - Estado"
//                                 required
//                             />
//
//                             <CustomInput
//                                 control={form.control}
//                                 name="healthInsurance"
//                                 label="Plano de Saúde"
//                                 placeholder="Nome do plano de saúde (opcional)"
//                             />
//
//                             <CustomTextarea
//                                 control={form.control}
//                                 name="notes"
//                                 label="Observações"
//                                 placeholder="Observações adicionais sobre o paciente (opcional)"
//                             />
//                         </form>
//                     </Form>
//                 </div>
//                 <DialogFooter className="flex justify-end space-x-2">
//                     <Button variant="outline" onClick={() => setOpen(false)}>
//                         Cancelar
//                     </Button>
//                     <Button
//                         type="submit"
//                         disabled={isSubmitting}
//                         onClick={form.handleSubmit(onSubmit)}
//                         className="bg-purple-600 hover:bg-purple-700 text-white"
//                     >
//                         {isSubmitting ? (
//                             <>
//                                 <span className="mr-2">Cadastrando</span>
//                                 <span className="animate-pulse">...</span>
//                             </>
//                         ) : (
//                             "Cadastrar Paciente"
//                         )}
//                     </Button>
//                 </DialogFooter>
//             </DialogContent>
//         </Dialog>
//     )
// }
//


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
import { patientSchema } from "@/lib/schema"
import { CustomInput } from "@/components/form/CustomInput"
import { PhoneInput } from "@/components/form/PhoneInput"
import { DateInput } from "@/components/form/DateInput"
import { CustomTextarea } from "@/components/form/CustomTextarea"
import { CustomSelect } from "@/components/form/CustomSelect"
import {useRouter} from "next/navigation";


const genderOptions = [
    { value: "MALE", label: "Masculino" },
    { value: "FEMALE", label: "Feminino" },
    { value: "OTHER", label: "Outro" },
    { value: "PREFER_NOT_TO_SAY", label: "Prefiro não informar" },
]

export function NewPatientDialog() {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()
    const form = useForm<z.infer<typeof patientSchema>>({
        resolver: zodResolver(patientSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            dateOfBirth: "",
            gender: undefined,
            contactEmail: "",
            contactPhone: "",
            address: "",
            medicalHistory: "",
        },
    })

    async function onSubmit(values: z.infer<typeof patientSchema>) {
        setIsSubmitting(true)
        try {

            if (response.success) {
                toast({
                    title: "Paciente cadastrado com sucesso!",
                    description: "Os dados do novo paciente foram salvos.",
                })
                form.reset()
                router.refresh() // This will revalidate all server components
                setOpen(false)
            } else {
                // toast({
                //     title: "Erro ao cadastrar paciente",
                //     description: response.error || "Ocorreu um erro ao salvar os dados.",
                //     // variant: "destructive",
                // })
            }
        } catch (error: any) {
            toast({
                title: "Erro ao cadastrar paciente",
                description: "Ocorreu um erro ao salvar os dados. Por favor, tente novamente." + error,
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
                            <CustomInput
                                control={form.control}
                                name="firstName"
                                label="Nome"
                                placeholder="Nome do paciente"
                                required
                            />

                            <CustomInput
                                control={form.control}
                                name="lastName"
                                label="Sobrenome"
                                placeholder="Sobrenome do paciente"
                                required
                            />

                            <CustomSelect
                                control={form.control}
                                name="gender"
                                label="Gênero"
                                placeholder="Selecione o gênero"
                                options={genderOptions}
                            />

                            <CustomInput
                                control={form.control}
                                name="contactEmail"
                                label="Email de Contato"
                                type="email"
                                placeholder="email@exemplo.com"
                                required
                            />

                            <PhoneInput
                                control={form.control}
                                name="contactPhone"
                                required
                            />

                            <DateInput
                                control={form.control}
                                name="dateOfBirth"
                                label="Data de Nascimento"
                                required
                            />

                            <CustomInput
                                control={form.control}
                                name="address"
                                label="Endereço"
                                placeholder="Rua, número, bairro, cidade - Estado"
                                required
                            />

                            <CustomTextarea
                                control={form.control}
                                name="medicalHistory"
                                label="Histórico Médico"
                                placeholder="Informações relevantes sobre o histórico médico do paciente (opcional)"
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
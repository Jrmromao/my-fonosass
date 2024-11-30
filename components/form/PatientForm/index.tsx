// // components/forms/PatientForm/index.tsx
// import { zodResolver } from "@hookform/resolvers/zod"
// import {useForm, UseFormReturn} from "react-hook-form"
// import {patientSchema} from "@/lib/schema";
// import {z} from "zod";
// import {FormControl, FormField, FormItem, FormLabel, Form} from "@/components/ui/form";
// import React from "react";
// import {Input} from "@/components/ui/input";
//
//
// type PatientFormData = z.infer<typeof patientSchema>
//
// export function PatientForm() {
//     const form = useForm<PatientFormData>({
//         resolver: zodResolver(patientSchema),
//         defaultValues: {
//             firstName: '',
//             lastName: '',
//             dateOfBirth: new Date(),
//             practiceId: '',
//             doctorId: ''
//         }
//     })
//
//     async function onSubmit(data: PatientFormData) {
//         try {
//             const validation = await patientSchema.safeParseAsync(data)
//             if (!validation.success) {
//                 return { error: validation.error.issues[0].message }
//             }
//
//             // await createPatient(validation.data)
//             form.reset()
//         } catch (error) {
//             console.error(error)
//         }
//     }
//
//     return (
//         <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
//                 <PersonalInfo form={form} />
//                 {/*<MedicalInfo form={form} />*/}
//                 <button
//                     type="submit"
//                     disabled={form.formState.isSubmitting}
//                 >
//                     {form.formState.isSubmitting ? 'Saving...' : 'Save Patient'}
//                 </button>
//                 {form.formState.errors.root && (
//                     <p className="text-red-500">{form.formState.errors.root.message}</p>
//                 )}
//             </form>
//         </Form>
//     )
// }
//
// // Modified Form Fields Component Example
// export function PersonalInfo({ form }: { form: UseFormReturn<PatientFormData> }) {
//     return (
//         <div className="grid grid-cols-2 gap-4">
//             <FormField
//                 control={form.control}
//                 name="firstName"
//                 render={({ field, fieldState }) => (
//                     <FormItem>
//                         <FormLabel>First Name</FormLabel>
//                         <FormControl>
//                             <Input {...field} />
//                         </FormControl>
//                         {fieldState.error && (
//                             <p className="text-red-500">{fieldState.error.message}</p>
//                         )}
//                     </FormItem>
//                 )}
//             />
//             {/* Other fields follow same pattern */}
//         </div>
//     )
// }

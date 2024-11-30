// import React, { useState } from 'react'
// import {
//     Card,
//     CardContent,
//     CardDescription,
//     CardHeader,
//     CardTitle,
// } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Button } from "@/components/ui/button"
// import { Textarea } from "@/components/ui/textarea"
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select"
// import { Checkbox } from "@/components/ui/checkbox"
// import {useToast} from "@/hooks/use-toast";
//
// interface FormDisplayProps {
//     form: {
//         id: string
//         title: string
//         description?: string
//         fields: Array<{
//             id: string
//             name: string
//             label: string
//             type: string
//             required: boolean
//             placeholder?: string
//             description?: string
//             options?: string // JSON string of options
//         }>
//     }
//     patientId: string
//     onSubmit?: () => void
// }
//
// export function FormDisplay({ form, patientId, onSubmit }: FormDisplayProps) {
//     const [formData, setFormData] = useState<Record<string, any>>({})
//     const [isSubmitting, setIsSubmitting] = useState(false)
//     const { toast } = useToast()
//
//     const handleFieldChange = (fieldId: string, value: any) => {
//         setFormData(prev => ({
//             ...prev,
//             [fieldId]: value
//         }))
//     }
//
//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault()
//         setIsSubmitting(true)
//
//         try {
//             const response = await fetch(`/api/forms/${form.id}/responses`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     patientId,
//                     responses: formData,
//                 }),
//             })
//
//             if (!response.ok) {
//                 throw new Error('Failed to submit form')
//             }
//
//             toast({
//                 title: "Form submitted successfully",
//                 description: "The form response has been saved.",
//             })
//
//             onSubmit?.()
//         } catch (error) {
//             toast({
//                 title: "Error submitting form",
//                 description: "There was a problem submitting the form. Please try again."+(error as Error).message,
//                 variant: "destructive",
//             })
//         } finally {
//             setIsSubmitting(false)
//         }
//     }
//
//     const renderField = (field: FormDisplayProps['form']['fields'][0]) => {
//         const commonProps = {
//             id: field.id,
//             "aria-label": field.label,
//             placeholder: field.placeholder,
//             required: field.required,
//         }
//
//         switch (field.type) {
//             case 'select':
//                 const options = field.options ? JSON.parse(field.options) : []
//                 return (
//                     <Select
//                         value={formData[field.id] || ''}
//                         onValueChange={(value) => handleFieldChange(field.id, value)}
//                     >
//                         <SelectTrigger>
//                             <SelectValue placeholder={field.placeholder} />
//                         </SelectTrigger>
//                         <SelectContent>
//                             {options.map((option: { value: string, label: string }) => (
//                                 <SelectItem key={option.value} value={option.value}>
//                                     {option.label}
//                                 </SelectItem>
//                             ))}
//                         </SelectContent>
//                     </Select>
//                 )
//
//             case 'checkbox':
//                 return (
//                     <Checkbox
//                         checked={formData[field.id] || false}
//                         onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
//                         {...commonProps}
//                     />
//                 )
//
//             case 'textarea':
//                 return (
//                     <Textarea
//                         value={formData[field.id] || ''}
//                         onChange={(e) => handleFieldChange(field.id, e.target.value)}
//                         {...commonProps}
//                     />
//                 )
//
//             default:
//                 return (
//                     <Input
//                         type={field.type}
//                         value={formData[field.id] || ''}
//                         onChange={(e) => handleFieldChange(field.id, e.target.value)}
//                         {...commonProps}
//                     />
//                 )
//         }
//     }
//
//     return (
//         <Card>
//             <CardHeader>
//                 <CardTitle>{form.title}</CardTitle>
//                 {form.description && <CardDescription>{form.description}</CardDescription>}
//             </CardHeader>
//             <CardContent>
//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     {form.fields.map((field) => (
//                         <div key={field.id} className="space-y-2">
//                             <Label htmlFor={field.id}>
//                                 {field.label}
//                                 {field.required && <span className="text-red-500 ml-1">*</span>}
//                             </Label>
//                             {field.description && (
//                                 <p className="text-sm text-gray-500">{field.description}</p>
//                             )}
//                             {renderField(field)}
//                         </div>
//                     ))}
//
//                     <Button type="submit" className="w-full" disabled={isSubmitting}>
//                         {isSubmitting ? "Submitting..." : "Submit"}
//                     </Button>
//                 </form>
//             </CardContent>
//         </Card>
//     )
// }

import React from 'react'

const FormDisplay = () => {
    return (
        <div>FormDisplay</div>
    )
}
export default FormDisplay

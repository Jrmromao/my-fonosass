// import React, {useState} from 'react'
// import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group"
// import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
// import {Label} from "@/components/ui/label";
// import {Switch} from "@/components/ui/switch";
// import {Button} from "@/components/ui/button";
// import {Input} from "@/components/ui/input";
// import {Textarea} from "@/components/ui/textarea";
//
//
// interface FieldOption {
//     label: string
//     value: string
// }
//
// // Then update the FormField interface to properly type the options
// interface FormField {
//     id: string
//     name: string
//     label: string
//     type: string
//     required: boolean
//     placeholder?: string
//     description?: string
//     options: FieldOption[] // Make it a proper array type instead of optional
//     validation?: {
//         min?: number
//         max?: number
//         minLength?: number
//         maxLength?: number
//         pattern?: string
//     }
// }
//
//
// export const FormPreview = ({ form }: { form: { title: string, description?: string, fields: FormField[] } }) => {
//     const [formData, setFormData] = useState<Record<string, any>>({})
//
//     const handleFieldChange = (name: string, value: any) => {
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }))
//     }
//
//     const renderField = (field: FormField) => {
//         switch (field.type) {
//             case 'radio':
//                 return (
//                     <RadioGroup
//                         value={formData[field.name] || ""}
//                         onValueChange={(value) => handleFieldChange(field.name, value)}
//                         className="space-y-1"
//                     >
//                         {field.options.map((option: FieldOption, index: number) => (
//                             <div key={index} className="flex items-center space-x-2">
//                                 <RadioGroupItem
//                                     value={option.value}
//                                     id={`${field.name}-${option.value}`}
//                                 />
//                                 <Label
//                                     htmlFor={`${field.name}-${option.value}`}
//                                 >
//                                     {option.label}
//                                 </Label>
//                             </div>
//                         ))}
//                     </RadioGroup>
//                 )
//             case 'select':
//                 return (
//                     <Select
//                         value={formData[field.name] || ""}
//                         onValueChange={(value) => handleFieldChange(field.name, value)}
//                     >
//                         <SelectTrigger>
//                             <SelectValue placeholder={field.placeholder} />
//                         </SelectTrigger>
//                         <SelectContent>
//                             {field.options?.map((option, index) => (
//                                 <SelectItem key={index} value={option.value}>
//                                     {option.label}
//                                 </SelectItem>
//                             ))}
//                         </SelectContent>
//                     </Select>
//                 )
//             case 'checkbox':
//                 return (
//                     <div className="flex items-center space-x-2">
//                         <Switch
//                             checked={formData[field.name] || false}
//                             onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
//                         />
//                         <Label>{field.label}</Label>
//                     </div>
//                 )
//             case 'textarea':
//                 return (
//                     <Textarea
//                         placeholder={field.placeholder || ""}
//                         value={formData[field.name] || ""}
//                         onChange={(e) => handleFieldChange(field.name, e.target.value)}
//                     />
//                 )
//             default:
//                 return (
//                     <Input
//                         type={field.type}
//                         placeholder={field.placeholder || ''}
//                         value={formData[field.name] || ""}
//                         onChange={(e) => handleFieldChange(field.name, e.target.value)}
//                     />
//                 )
//         }
//     }
//
//     return (
//         <div className="space-y-6">
//             <div>
//                 <h2 className="text-lg font-semibold">{form.title}</h2>
//                 {form.description && (
//                     <p className="text-sm text-muted-foreground mt-1">
//                         {form.description}
//                     </p>
//                 )}
//             </div>
//
//             <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-4">
//                 {form.fields.map((field) => (
//                     <div key={field.id} className="space-y-2">
//                         <Label>
//                             {field.label}
//                             {field.required && <span className="text-destructive ml-1">*</span>}
//                         </Label>
//                         {field.description && (
//                             <p className="text-sm text-muted-foreground">
//                                 {field.description}
//                             </p>
//                         )}
//                         {renderField(field)}
//                     </div>
//                 ))}
//             </div>
//
//             <Button className="w-full" type="button">
//                 Submit
//             </Button>
//         </div>
//     )
// }

import React from 'react'

const FormPreview = () => {
    return (
        <div>FormPreview</div>
    )
}
export default FormPreview

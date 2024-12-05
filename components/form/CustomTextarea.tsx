// components/form/CustomTextarea.tsx
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Control } from "react-hook-form"

interface CustomTextareaProps {
    control: Control<any>
    name: string
    label: string
    placeholder?: string
    required?: boolean
}

export function CustomTextarea({
                                   control,
                                   name,
                                   label,
                                   placeholder,
                                   required = false,
                               }: CustomTextareaProps) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
                        {label}
                    </FormLabel>
                    <FormControl>
                        <Textarea
                            placeholder={placeholder}
                            className="min-h-[100px]"
                            {...field}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
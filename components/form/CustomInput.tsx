// components/form/CustomInput.tsx
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Control } from "react-hook-form"

interface CustomInputProps {
    control: Control<any>
    name: string
    label: string
    placeholder?: string
    type?: string
    required?: boolean
    description?: string
}

export function CustomInput({
                                control,
                                name,
                                label,
                                placeholder,
                                type = "text",
                                required = false,
                                description,
                            }: CustomInputProps) {
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
                        <Input type={type} placeholder={placeholder} {...field} />
                    </FormControl>
                    {description && (
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
// components/form/CustomSelect.tsx
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Control } from "react-hook-form"

interface Option {
    value: string
    label: string
}

interface CustomSelectProps {
    control: Control<any>
    name: string
    label: string
    placeholder?: string
    options: Option[]
    required?: boolean
    disabled?: boolean
    className?: string
}

export function CustomSelect({
                                 control,
                                 name,
                                 label,
                                 placeholder = "Selecione...",
                                 options,
                                 required = false,
                                 disabled = false,
                                 className
                             }: CustomSelectProps) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    <FormLabel className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
                        {label}
                    </FormLabel>
                    <Select
                        disabled={disabled}
                        onValueChange={field.onChange}
                         value={field.value}
                    >
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={placeholder} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
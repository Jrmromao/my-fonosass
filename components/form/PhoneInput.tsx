// components/form/PhoneInput.tsx
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Control } from "react-hook-form"
import { useEffect } from "react"

interface PhoneInputProps {
    control: Control<any>
    name: string
    required?: boolean
}

export function PhoneInput({ control, name, required = false }: PhoneInputProps) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field: { onChange, ...field } }) => (
                <FormItem>
                    <FormLabel className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
                        Telefone
                    </FormLabel>
                    <FormControl>
                        <Input
                            {...field}
                            onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, '')
                                if (value.length <= 11) {
                                    value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3')
                                }
                                onChange(value)
                            }}
                            placeholder="(00) 00000-0000"
                            maxLength={15}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
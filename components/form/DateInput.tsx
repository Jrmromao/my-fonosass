// components/form/DateInput.tsx
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { CalendarIcon } from "lucide-react"
import { Control } from "react-hook-form"
import { format, isValid, parse } from "date-fns"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { useState, useEffect } from "react"

interface DateInputProps {
    control: Control<any>
    name: string
    label: string
    required?: boolean
    isBirthDate?: boolean
}

export function DateInput({
                              control,
                              name,
                              label,
                              required = false,
                              isBirthDate = false
                          }: DateInputProps) {
    const [open, setOpen] = useState(false)
    const [displayValue, setDisplayValue] = useState("")

    const formatDateInput = (input: string) => {
        // Keep only numbers
        const numbers = input.replace(/\D/g, "")

        // Build the formatted string
        const parts = []
        if (numbers.length > 0) parts.push(numbers.slice(0, 2))
        if (numbers.length > 2) parts.push(numbers.slice(2, 4))
        if (numbers.length > 4) parts.push(numbers.slice(4, 8))

        return parts.join("/")
    }

    const validateAndParseDate = (dateString: string) => {
        // Check if we have a complete date (DD/MM/YYYY)
        if (dateString.length !== 10) return null

        const [day, month, year] = dateString.split('/')

        // Ensure we have all parts and they're the right length
        if (!day || !month || !year || year.length !== 4) return null

        const date = parse(dateString, 'dd/MM/yyyy', new Date())
        if (!isValid(date)) return null

        // For birth dates, check if it's not in the future
        if (isBirthDate && date > new Date()) return null

        return date
    }

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
                        {label}
                    </FormLabel>
                    <div className="relative">
                        <Input
                            placeholder="DD/MM/YYYY"
                            value={displayValue}
                            onChange={(e) => {
                                const formatted = formatDateInput(e.target.value)
                                setDisplayValue(formatted)

                                const validDate = validateAndParseDate(formatted)
                                if (validDate) {
                                    field.onChange(format(validDate, 'yyyy-MM-dd'))
                                }
                            }}
                            onFocus={(e) => e.target.select()}
                            className="pr-10"
                            maxLength={10}
                            inputMode="numeric"
                        />
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                >
                                    <CalendarIcon className="h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    mode="single"
                                    selected={field.value ? new Date(field.value) : undefined}
                                    onSelect={(date) => {
                                        if (date) {
                                            field.onChange(format(date, 'yyyy-MM-dd'))
                                            setDisplayValue(format(date, 'dd/MM/yyyy'))
                                        }
                                        setOpen(false)
                                    }}
                                    disabled={isBirthDate ? { after: new Date() } : undefined}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Formato: DD/MM/YYYY
                    </p>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
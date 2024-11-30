import {FieldOption, FormField} from "@/types/types";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, X } from 'lucide-react'


interface FieldOptionsProps {
    currentField: FormField
    onUpdateField: (field: FormField) => void
}

export function FieldOptions({ currentField, onUpdateField }: FieldOptionsProps) {
    if (!['select', 'radio'].includes(currentField.type)) return null

    const generateId = () => Math.random().toString(36).substr(2, 9)

    const addOption = () => {
        onUpdateField({
            ...currentField,
            options: [...(currentField.options || []), {
                id: generateId(),
                label: '',
                value: ''
            }]
        })
    }
    const updateOption = (optionId: string, key: 'label' | 'value', value: string) => {
        const newOptions = currentField.options.map((option: FieldOption) =>
            option.id === optionId
                ? { ...option, [key]: value }
                : option
        )
        onUpdateField({ ...currentField, options: newOptions })
    }
    const removeOption = (optionId: string) => {
        const newOptions = currentField.options.filter((option: FieldOption) => option.id !== optionId)
        onUpdateField({ ...currentField, options: newOptions })
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label>{currentField.type === 'radio' ? 'Radio Options' : 'Select Options'}</Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Option
                </Button>
            </div>
            <div className="space-y-2">
                {(!currentField.options || currentField.options.length === 0) && (
                    <div className="text-sm text-muted-foreground">
                        {`No options added yet. Click "Add Option" to add some`}
                    </div>
                )}
                {currentField.options?.map((option) => (
                    <div key={option.id} className="flex gap-2">
                        <Input
                            placeholder="Option Label"
                            value={option.label}
                            onChange={e => updateOption(option.id, 'label', e.target.value)}
                        />
                        <Input
                            placeholder="Option Value"
                            value={option.value}
                            onChange={e => updateOption(option.id, 'value', e.target.value)}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(option.id)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    )
}

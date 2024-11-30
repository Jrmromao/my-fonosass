import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoveUp, MoveDown, X } from 'lucide-react'
import {FIELD_TYPES, FormField} from "@/types/types";

interface FieldListProps {
    fields: FormField[]
    onMoveField: (id: string, direction: 'up' | 'down') => void
    onRemoveField: (id: string) => void
}

export function FieldList({ fields, onMoveField, onRemoveField }: FieldListProps) {
    return (
        <>
            {fields.map((field, index) => (
                <Card key={field.id} className="relative">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base">
                                    {field.label || 'Untitled Field'}
                                </CardTitle>
                                <CardDescription>
                                    {field.name} - {FIELD_TYPES.find(t => t.value === field.type)?.label}
                                </CardDescription>
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onMoveField(field.id, 'up')}
                                    disabled={index === 0}
                                    title="Move Up"
                                >
                                    <MoveUp className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onMoveField(field.id, 'down')}
                                    disabled={index === fields.length - 1}
                                    title="Move Down"
                                >
                                    <MoveDown className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onRemoveField(field.id)}
                                    title="Remove Field"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            ))}
        </>
    )
}
// components/AddFieldDialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { FieldOptions } from './FieldOptions'
import {FIELD_TYPES, FormField} from "@/types/types";

interface AddFieldDialogProps {
    isOpen: boolean
    onClose: () => void
    currentField: FormField | null
    onUpdateField: (field: FormField) => void
    onSave: () => void
}

export function AddFieldDialog({
                                   isOpen,
                                   onClose,
                                   currentField,
                                   onUpdateField,
                                   onSave
                               }: AddFieldDialogProps) {
    if (!currentField) return null

    const handleTypeChange = (value: string) => {
        onUpdateField({
            ...currentField,
            type: value,
            options: [] // Reset options when switching field types
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Field</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="fieldType">Field Type</Label>
                        <Select
                            value={currentField.type}
                            onValueChange={handleTypeChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select field type" />
                            </SelectTrigger>
                            <SelectContent>
                                {FIELD_TYPES.map(type => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fieldName">Field Name</Label>
                        <Input
                            id="fieldName"
                            placeholder="Enter field name"
                            value={currentField.name}
                            onChange={e =>
                                onUpdateField({ ...currentField, name: e.target.value })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fieldLabel">Field Label</Label>
                        <Input
                            id="fieldLabel"
                            placeholder="Enter field label"
                            value={currentField.label}
                            onChange={e =>
                                onUpdateField({ ...currentField, label: e.target.value })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fieldPlaceholder">Placeholder</Label>
                        <Input
                            id="fieldPlaceholder"
                            placeholder="Enter placeholder text"
                            value={currentField.placeholder}
                            onChange={e =>
                                onUpdateField({ ...currentField, placeholder: e.target.value })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fieldDescription">Description</Label>
                        <Textarea
                            id="fieldDescription"
                            placeholder="Enter field description"
                            value={currentField.description}
                            onChange={e =>
                                onUpdateField({ ...currentField, description: e.target.value })
                            }
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={currentField.required}
                            onCheckedChange={checked =>
                                onUpdateField({ ...currentField, required: checked })
                            }
                        />
                        <Label>Required Field</Label>
                    </div>

                    <FieldOptions
                        currentField={currentField}
                        onUpdateField={onUpdateField}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={onSave}>
                        Add Field
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
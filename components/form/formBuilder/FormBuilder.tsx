import {useState} from 'react'
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {PlusCircle} from 'lucide-react'


import {FormField} from "@/types/types";
import {FormDetails} from "@/components/form/draft/FormDetails";
import {FieldList} from "@/components/form/draft/FieldList";
import {AddFieldDialog} from "@/components/form/draft/AddFieldDialog";
import {FormPreview} from "@/components/form/draft/FormPreview";

interface FormBuilderProps {
    onSubmit: (data: {
        title: string
        description?: string
        fields: FormField[]
    }) => void
}

export function FormBuilder({ onSubmit }: FormBuilderProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [fields, setFields] = useState<FormField[]>([])
    const [currentField, setCurrentField] = useState<FormField | null>(null)
    const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false)
    const [showPreview, setShowPreview] = useState(false);

    // const generateId = () => {
    //     return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // };
    const handleAddFieldClick = () => {

        setIsFieldDialogOpen(true)
    }
    const handleCloseDialog = () => {
        setCurrentField(null)
        setIsFieldDialogOpen(false)
    }

    const handleSaveField = () => {
        if (!currentField || !currentField.name || !currentField.label) {
            alert('Please fill in all required fields');
            return;
        }

        // Check for duplicate field names
        const isDuplicateName = fields.some(field =>
            field.name.toLowerCase() === currentField.name.toLowerCase()
        );

        if (isDuplicateName) {
            alert('A field with this name already exists. Please use a unique name.');
            return;
        }

        // For select/radio fields, validate options
        if (['select', 'radio'].includes(currentField.type)) {
            if (!currentField.options || currentField.options.length === 0) {
                alert('Please add at least one option for this field type');
                return;
            }

            // Check if all options have values
            const hasEmptyOptions = currentField.options.some(
                option => !option.label || !option.value
            );

            if (hasEmptyOptions) {
                alert('Please fill in all option labels and values');
                return;
            }
        }

        // Add field only once
        setFields(prev => [...prev, currentField]);
        handleCloseDialog();
    };

    const moveField = (id: string, direction: 'up' | 'down') => {
        const index = fields.findIndex(field => field.id === id)
        if (index === -1) return

        const newFields = [...fields]
        if (direction === 'up' && index > 0) {
            [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]]
        } else if (direction === 'down' && index < fields.length - 1) {
            [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]]
        }
        setFields(newFields)
    }

    const removeField = (id: string) => {
        setFields(prev => prev.filter(field => field.id !== id))
    }

    const handleSubmit = () => {
        if (title && fields.length > 0) {
            onSubmit({
                title,
                description,
                fields
            })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end space-x-4">
                <Button
                    variant="outline"
                    onClick={() => setShowPreview(!showPreview)}
                >
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                </Button>
            </div>

            <div className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
                <div className="space-y-6">
                    <FormDetails
                        title={title}
                        description={description}
                        setTitle={setTitle}
                        setDescription={setDescription}
                    />

                    <FieldList
                        fields={fields}
                        onMoveField={moveField}
                        onRemoveField={removeField}
                    />

                    <Button onClick={handleAddFieldClick} className="w-full">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Field
                    </Button>

                    <AddFieldDialog
                        isOpen={isFieldDialogOpen}
                        onClose={handleCloseDialog}
                        currentField={currentField}
                        onUpdateField={setCurrentField}
                        onSave={handleSaveField}
                    />

                    {fields.length > 0 && (
                        <Card>
                            <CardContent className="pt-6">
                                <Button onClick={handleSubmit} className="w-full">
                                    Create Form
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {showPreview && (
                    <div className="w-full overflow-auto">
                        <FormPreview
                            title={title}
                            description={description}
                            fields={fields}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
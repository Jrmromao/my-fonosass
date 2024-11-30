// components/FormPreview.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { FormField } from "@/types/types"

interface FormPreviewProps {
    title: string;
    description: string;
    fields: FormField[];
}

export function FormPreview({ title, description, fields }: FormPreviewProps) {
    const renderField = (field: FormField) => {
        switch (field.type) {
            case 'text':
            case 'email':
            case 'number':
                return (
                    <Input
                        type={field.type}
                        placeholder={field.placeholder}
                        disabled
                    />
                );
            case 'textarea':
                return (
                    <Textarea
                        placeholder={field.placeholder}
                        disabled
                    />
                );
            case 'select':
                return (
                    <Select disabled>
                        <SelectTrigger>
                            <SelectValue placeholder={field.placeholder || 'Select an option'} />
                        </SelectTrigger>
                        <SelectContent>
                            {field.options?.map((option) => (
                                <SelectItem key={option.id} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            case 'radio':
                return (
                    <RadioGroup disabled>
                        {field.options?.map((option) => (
                            <div key={option.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.value} id={option.id} />
                                <Label htmlFor={option.id}>{option.label}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                );
            case 'checkbox':
                return (
                    <div className="flex items-center space-x-2">
                        <Checkbox id={field.id} disabled />
                        <Label htmlFor={field.id}>{field.label}</Label>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Card className="w-[21cm] min-h-[29.7cm] mx-auto bg-white shadow-lg">
            <CardHeader>
                <CardTitle>{title || 'Untitled Form'}</CardTitle>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
            </CardHeader>
            <CardContent className="space-y-6">
                {fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                        <Label>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {field.description && (
                            <p className="text-sm text-muted-foreground">{field.description}</p>
                        )}
                        {renderField(field)}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
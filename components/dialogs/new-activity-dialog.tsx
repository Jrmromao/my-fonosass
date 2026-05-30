'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createActivity } from '@/lib/actions/activity.action';
import phonemes from '@/utils/phonemeList';
import { Plus } from 'lucide-react';
import { useState } from 'react';

interface NewActivityDialogProps {
  onSuccess?: () => void;
}

export function NewActivityDialog({ onSuccess }: NewActivityDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Add files
    const fileInput = form.querySelector<HTMLInputElement>('input[type="file"]');
    if (fileInput?.files) {
      Array.from(fileInput.files).forEach((file, i) => {
        formData.append(`file-${i}`, file);
      });
    }

    const result = await createActivity(formData);
    setSubmitting(false);

    if (result.success) {
      setOpen(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 text-xs bg-foreground text-background hover:bg-foreground/90">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Nova atividade
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-foreground">Nova atividade</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Name */}
          <div>
            <Label htmlFor="name" className="text-xs text-muted-foreground">Nome</Label>
            <Input id="name" name="name" required className="h-8 text-sm mt-1" placeholder="Ex: Caça-Palavras Animais" />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-xs text-muted-foreground">Descrição</Label>
            <Textarea id="description" name="description" required rows={3} className="text-sm mt-1 resize-none" placeholder="Descreva a atividade..." />
          </div>

          {/* Grid: Phoneme + Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Fonema</Label>
              <Select name="phoneme" required>
                <SelectTrigger className="h-8 text-sm mt-1">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {phonemes.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Tipo</Label>
              <Select name="type" required>
                <SelectTrigger className="h-8 text-sm mt-1">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SPEECH">Fala</SelectItem>
                  <SelectItem value="LANGUAGE">Linguagem</SelectItem>
                  <SelectItem value="COGNITIVE">Cognitivo</SelectItem>
                  <SelectItem value="MOTOR">Motor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid: Difficulty + Age */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Dificuldade</Label>
              <Select name="difficulty" required>
                <SelectTrigger className="h-8 text-sm mt-1">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Iniciante</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediário</SelectItem>
                  <SelectItem value="ADVANCED">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Faixa etária</Label>
              <Select name="ageRange" required>
                <SelectTrigger className="h-8 text-sm mt-1">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESCHOOL">4-5 anos</SelectItem>
                  <SelectItem value="CHILD">6-10 anos</SelectItem>
                  <SelectItem value="TEENAGER">11-12 anos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* File upload */}
          <div>
            <Label htmlFor="files" className="text-xs text-muted-foreground">Ficheiro (PDF ou imagem)</Label>
            <Input id="files" type="file" accept=".pdf,.png,.jpg,.jpeg" multiple className="h-8 text-xs mt-1" />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" className="h-8 text-xs bg-foreground text-background hover:bg-foreground/90" disabled={submitting}>
              {submitting ? 'A criar...' : 'Criar atividade'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createActivity } from '@/lib/actions/activity.action';
import { ACTIVITY_CATEGORIES, findCategory } from '@/lib/activityCategories';
import {
  AGE_LABELS,
  DIFFICULTY_LABELS,
  phonemeLabel,
} from '@/lib/activityLabels';
import { PHONEME_GROUPS } from '@/lib/phonemes';
import { Plus } from 'lucide-react';
import { useState } from 'react';

// Must match serverActions.bodySizeLimit in next.config.js (Vercel caps
// request bodies at 4.5 MB).
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const REQUIRED_SELECTS: { name: string; label: string }[] = [
  { name: 'category', label: 'categoria' },
  { name: 'difficulty', label: 'dificuldade' },
  { name: 'ageRange', label: 'faixa etária' },
];

interface NewActivityDialogProps {
  /** Called with the new activity's name after it is saved. */
  onSuccess?: (name: string) => void;
}

export function NewActivityDialog({ onSuccess }: NewActivityDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState('');
  // Controlled so it can be cleared when the category changes.
  const [phoneme, setPhoneme] = useState('');
  const category = findCategory(categoryId);

  const resetFields = () => {
    setCategoryId('');
    setPhoneme('');
    setError(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (submitting) return;
    setOpen(next);
    if (!next) resetFields();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    // Controlled Radix selects: send the state, not the hidden <select>,
    // which falls back to its first option when the value is empty.
    formData.set('category', categoryId);
    formData.set('phoneme', category?.requiresPhoneme ? phoneme : '');

    // Radix selects don't block submit on their own: check them here.
    const missing = REQUIRED_SELECTS.filter((f) => !formData.get(f.name));
    if (category?.requiresPhoneme && !phoneme) {
      // Keep the message in form order: categoria, fonema, dificuldade...
      missing.unshift({ name: 'phoneme', label: 'fonema' });
    }
    if (missing.length > 0) {
      setError(`Escolha: ${missing.map((f) => f.label).join(', ')}.`);
      return;
    }

    const fileInput =
      form.querySelector<HTMLInputElement>('input[type="file"]');
    const files = fileInput?.files ? Array.from(fileInput.files) : [];
    const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
    if (totalBytes > MAX_UPLOAD_BYTES) {
      setError(
        'Os arquivos passam de 4 MB no total. Reduza o tamanho ou envie menos arquivos.'
      );
      return;
    }
    files.forEach((file, i) => formData.append(`file-${i}`, file));

    setSubmitting(true);
    try {
      const result = await createActivity(formData);
      if (result.success) {
        const name = String(formData.get('name') || '').trim();
        form.reset();
        resetFields();
        setOpen(false);
        onSuccess?.(name);
      } else {
        setError(result.error || 'Não foi possível criar a atividade.');
      }
    } catch {
      // Thrown by the framework, e.g. a body over the size limit or a
      // network failure: the action itself never ran.
      setError(
        'Não foi possível enviar. Verifique a conexão e o tamanho dos arquivos.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const triggerClass = 'h-9 text-sm mt-1';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="h-9 bg-neutral-900 text-sm text-white hover:bg-neutral-800"
        >
          <Plus className="h-4 w-4 mr-1.5" aria-hidden />
          Nova atividade
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-neutral-900">
            Nova atividade
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2" noValidate>
          <div>
            <Label htmlFor="name" className="text-sm text-neutral-900">
              Nome
            </Label>
            <Input
              id="name"
              name="name"
              required
              minLength={3}
              className="h-9 text-sm mt-1"
              placeholder="Ex.: Caça-palavras: animais"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-sm text-neutral-900">
              Descrição
            </Label>
            <Textarea
              id="description"
              name="description"
              required
              minLength={10}
              rows={3}
              className="text-sm mt-1 resize-none"
              placeholder="Pelo menos 10 caracteres"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm text-neutral-900">Categoria</Label>
              <Select
                name="category"
                value={categoryId}
                onValueChange={(v) => {
                  setCategoryId(v);
                  setPhoneme('');
                }}
              >
                <SelectTrigger className={triggerClass} aria-label="Categoria">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Always visible so it is easy to find; only used for Fonema. */}
            <div>
              <Label
                className={
                  category && !category.requiresPhoneme
                    ? 'text-sm text-neutral-400'
                    : 'text-sm text-neutral-900'
                }
              >
                Fonema
              </Label>
              <Select
                name="phoneme"
                value={phoneme}
                onValueChange={setPhoneme}
                disabled={!category?.requiresPhoneme}
              >
                <SelectTrigger className={triggerClass} aria-label="Fonema">
                  <SelectValue
                    placeholder={
                      !category
                        ? 'Escolha a categoria'
                        : category.requiresPhoneme
                          ? 'Selecione'
                          : 'Não se aplica'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {PHONEME_GROUPS.map((group) => (
                    <SelectGroup key={group.id}>
                      <SelectLabel>{group.title}</SelectLabel>
                      {group.entries.map((entry) => (
                        <SelectItem key={entry.code} value={entry.code}>
                          {phonemeLabel(entry.code)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm text-neutral-900">Dificuldade</Label>
              <Select name="difficulty">
                <SelectTrigger
                  className={triggerClass}
                  aria-label="Dificuldade"
                >
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DIFFICULTY_LABELS).map(([value, text]) => (
                    <SelectItem key={value} value={value}>
                      {text}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-neutral-900">Faixa etária</Label>
              <Select name="ageRange">
                <SelectTrigger
                  className={triggerClass}
                  aria-label="Faixa etária"
                >
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(AGE_LABELS).map(([value, text]) => (
                    <SelectItem key={value} value={value}>
                      {text}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="files" className="text-sm text-neutral-900">
              Arquivo (PDF ou imagem, até 4 MB)
            </Label>
            <Input
              id="files"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              multiple
              className="h-9 text-sm mt-1"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            >
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 text-sm"
              disabled={submitting}
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-9 bg-neutral-900 text-sm text-white hover:bg-neutral-800"
              disabled={submitting}
            >
              {submitting ? 'Criando...' : 'Criar atividade'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

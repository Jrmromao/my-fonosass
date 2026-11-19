'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCSRF } from '@/hooks/useCSRF';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

// Same limits as PATCH /api/admin/activities/[id].
const NAME_MIN = 3;
const NAME_MAX = 100;
const DESCRIPTION_MIN = 10;
const DESCRIPTION_MAX = 2000;

export interface EditableActivity {
  id: string;
  name: string;
  description: string;
}

interface Props {
  activity: EditableActivity | null;
  onClose: () => void;
  /** Called after the server saved, so the list can refresh. */
  onSaved: () => void;
}

export function ActivityEditDialog({ activity, onClose, onSaved }: Props) {
  const queryClient = useQueryClient();
  const { csrfToken } = useCSRF();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    setName(activity?.name ?? '');
    setDescription(activity?.description ?? '');
  }, [activity]);

  const save = useMutation({
    mutationFn: async (input: {
      id: string;
      name: string;
      description: string;
    }) => {
      const res = await fetch(`/api/admin/activities/${input.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken ?? '',
        },
        body: JSON.stringify({
          name: input.name,
          description: input.description,
        }),
      });
      const json: { success?: boolean; error?: string } = await res
        .json()
        .catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Não foi possível salvar.');
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['activities'] });
      onSaved();
      onClose();
    },
  });

  const nameOk = name.trim().length >= NAME_MIN && name.length <= NAME_MAX;
  const descriptionOk =
    description.trim().length >= DESCRIPTION_MIN &&
    description.length <= DESCRIPTION_MAX;
  const dirty =
    !!activity &&
    (name.trim() !== activity.name ||
      description.trim() !== activity.description);

  return (
    <Dialog
      open={!!activity}
      onOpenChange={(open) => {
        if (!open && !save.isPending) {
          save.reset();
          onClose();
        }
      }}
    >
      <DialogContent className="flex max-h-[85vh] max-w-xl flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Editar atividade</DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <div>
            <Label htmlFor="activity-edit-name">Título</Label>
            <Input
              id="activity-edit-name"
              value={name}
              maxLength={NAME_MAX}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {name.length}/{NAME_MAX}
            </p>
          </div>
          <div>
            <Label htmlFor="activity-edit-description">Descrição</Label>
            <Textarea
              id="activity-edit-description"
              value={description}
              maxLength={DESCRIPTION_MAX}
              rows={8}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {description.length}/{DESCRIPTION_MAX}
            </p>
          </div>
          {save.isError && (
            <p role="alert" className="text-sm text-destructive">
              {save.error instanceof Error
                ? save.error.message
                : 'Não foi possível salvar.'}
            </p>
          )}
        </div>

        <DialogFooter className="border-t border-border px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={save.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={
              !activity ||
              !csrfToken ||
              !dirty ||
              !nameOk ||
              !descriptionOk ||
              save.isPending
            }
            onClick={() =>
              activity &&
              save.mutate({
                id: activity.id,
                name: name.trim(),
                description: description.trim(),
              })
            }
          >
            {save.isPending ? 'Salvando…' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

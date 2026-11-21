'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PRO_PLAN, YEARLY_DISCOUNT, formatBRL } from '@/lib/pricing';
import { useState } from 'react';

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Monthly / annual Stripe checkout choice. */
export function UpgradeDialog({ open, onOpenChange }: UpgradeDialogProps) {
  const [loading, setLoading] = useState<'monthly' | 'yearly' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async (interval: 'monthly' | 'yearly') => {
    setLoading(interval);
    setError(null);
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval }),
      });
      const json = await res.json();
      if (res.ok && json.url) {
        window.location.href = json.url;
        return;
      }
    } catch {
      /* falls through to the error message */
    }
    setError('Não foi possível abrir o pagamento. Tente novamente.');
    setLoading(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setError(null);
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Assine para baixar toda a biblioteca
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Com o plano {PRO_PLAN.name} você baixa todas as atividades, com
            novidades todo mês. Cancele quando quiser.
          </p>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <div className="space-y-2">
            <Button
              className="w-full h-10 bg-coral-700 hover:bg-coral-800 text-white text-sm font-semibold"
              disabled={loading !== null}
              onClick={() => startCheckout('monthly')}
            >
              {loading === 'monthly'
                ? 'Abrindo pagamento...'
                : `Mensal: ${formatBRL(PRO_PLAN.monthlyPrice)}/mês`}
            </Button>
            <Button
              variant="outline"
              className="w-full h-10 border-neutral-300 text-sm font-semibold"
              disabled={loading !== null}
              onClick={() => startCheckout('yearly')}
            >
              {loading === 'yearly'
                ? 'Abrindo pagamento...'
                : `Anual: ${formatBRL(PRO_PLAN.yearlyPrice)}/ano (${YEARLY_DISCOUNT.percent}% de desconto)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

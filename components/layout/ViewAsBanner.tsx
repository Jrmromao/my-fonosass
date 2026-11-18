'use client';

import { useCSRF } from '@/hooks/useCSRF';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

const LABELS: Record<string, string> = {
  assinante: 'assinante',
  'sem-assinatura': 'usuário sem assinatura',
};

/** Shown while an admin is testing with "Ver como"; always offers the exit. */
export function ViewAsBanner() {
  const { csrfToken } = useCSRF();
  const [leaving, setLeaving] = useState(false);
  const { data } = useQuery<{ data: { mode: string | null } }>({
    queryKey: ['view-as'],
    queryFn: async () => {
      const res = await fetch('/api/admin/view-as');
      if (!res.ok) throw new Error('failed');
      return res.json();
    },
    staleTime: 60_000,
  });
  const mode = data?.data.mode;
  if (!mode) return null;

  const leave = async () => {
    setLeaving(true);
    try {
      await fetch('/api/admin/view-as', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken ?? '',
        },
        body: JSON.stringify({ mode: null }),
      });
    } finally {
      window.location.assign('/dashboard/profile?tab=administracao');
    }
  };

  return (
    <div
      role="status"
      className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 bg-amber-50 px-6 py-2 text-sm text-amber-900"
    >
      <p>
        <span className="font-semibold">Modo de teste:</span> você está vendo
        como {LABELS[mode] ?? mode}. Seu papel de administrador não mudou.
      </p>
      <button
        type="button"
        onClick={leave}
        disabled={leaving || !csrfToken}
        className="font-semibold underline underline-offset-4"
      >
        {leaving ? 'Saindo...' : 'Sair do modo de teste'}
      </button>
    </div>
  );
}

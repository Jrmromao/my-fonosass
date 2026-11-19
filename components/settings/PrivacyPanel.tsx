'use client';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useCSRF } from '@/hooks/useCSRF';
import { useAnalyticsConsent, writeConsent } from '@/lib/cookieConsent';
import {
  DELETE_CONFIRMATION_WORD,
  DPO_EMAIL,
  PRIVACY_RESPONSE_TIME,
} from '@/lib/privacy';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

interface ConsentStatus {
  data?: {
    consentType: string;
    granted: boolean;
    expiresAt: string | null;
  }[];
}

interface SubscriptionInfo {
  data?: { subscribed: boolean };
}

const DELETE_ERRORS: Record<string, string> = {
  ACCOUNT_HAS_CONTENT: `Sua conta tem conteúdo publicado e não pode ser excluída por aqui. Escreva para ${DPO_EMAIL}.`,
  BILLING_CANCEL_FAILED: `Não conseguimos cancelar a sua assinatura, então nada foi excluído. Tente de novo ou escreva para ${DPO_EMAIL}.`,
  DELETION_FLAG_FAILED: `Não foi possível iniciar a exclusão agora, então nada foi excluído. Tente de novo ou escreva para ${DPO_EMAIL}.`,
  LOGIN_DELETE_FAILED: `Seus dados foram excluídos, mas o seu login ainda existe. Escreva para ${DPO_EMAIL} para concluir.`,
};

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-violet-50 p-6">
      <h3 className="mb-5 text-xs font-semibold uppercase tracking-wide text-neutral-600">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Row({
  id,
  title,
  description,
  control,
}: {
  id: string;
  title: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-3 first:pt-0 last:pb-0">
      <div>
        <Label
          htmlFor={id}
          className="text-sm font-medium text-neutral-900 cursor-pointer"
        >
          {title}
        </Label>
        <p id={`${id}-desc`} className="mt-0.5 text-sm text-neutral-600">
          {description}
        </p>
      </div>
      {control}
    </div>
  );
}

export function PrivacyPanel() {
  const queryClient = useQueryClient();
  const { csrfToken } = useCSRF();
  const analyticsConsent = useAnalyticsConsent();
  const hasAnalytics =
    !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
    !!process.env.NEXT_PUBLIC_SENTRY_DSN;

  const [marketingSaving, setMarketingSaving] = useState(false);
  const [marketingError, setMarketingError] = useState<string | null>(null);

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const [correction, setCorrection] = useState('');
  const [correctionSending, setCorrectionSending] = useState(false);
  const [correctionMsg, setCorrectionMsg] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: consents, isLoading } = useQuery<ConsentStatus>({
    queryKey: ['consent-status'],
    queryFn: async () => {
      const res = await fetch('/api/consent/status');
      if (!res.ok) throw new Error('Falha ao carregar preferências');
      return res.json();
    },
  });

  const { data: subscription } = useQuery<SubscriptionInfo>({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      const res = await fetch('/api/subscription/status');
      if (!res.ok) throw new Error('Falha ao carregar a assinatura');
      return res.json();
    },
  });

  const marketingOn =
    consents?.data?.some(
      (c) =>
        c.consentType === 'MARKETING_COMMUNICATIONS' &&
        c.granted &&
        (!c.expiresAt || new Date(c.expiresAt) > new Date())
    ) ?? false;

  const setMarketing = async (value: boolean) => {
    setMarketingSaving(true);
    setMarketingError(null);
    try {
      const res = await fetch('/api/consent/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken ?? '',
        },
        body: JSON.stringify({ marketingCommunications: value }),
      });
      if (!res.ok) throw new Error('save failed');
      await queryClient.invalidateQueries({ queryKey: ['consent-status'] });
    } catch {
      setMarketingError('Não foi possível salvar. Tente novamente.');
    } finally {
      setMarketingSaving(false);
    }
  };

  const exportData = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const res = await fetch('/api/user-data/export');
      if (!res.ok) throw new Error('export failed');
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = 'almanaque-da-fala-meus-dados.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportError('Não foi possível baixar os seus dados. Tente novamente.');
    } finally {
      setExporting(false);
    }
  };

  const sendCorrection = async () => {
    setCorrectionSending(true);
    setCorrectionMsg(null);
    try {
      const res = await fetch('/api/user-data/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken ?? '',
        },
        body: JSON.stringify({ description: correction }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(typeof json.error === 'string' ? json.error : '');
      }
      setCorrection('');
      setCorrectionMsg({
        ok: true,
        text: `Pedido enviado. Respondemos por email. Prazo: ${PRIVACY_RESPONSE_TIME.toLowerCase()}.`,
      });
    } catch (error) {
      setCorrectionMsg({
        ok: false,
        text:
          error instanceof Error && error.message
            ? error.message
            : 'Não foi possível enviar o pedido. Tente novamente.',
      });
    } finally {
      setCorrectionSending(false);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch('/api/user-data/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken ?? '',
        },
        body: JSON.stringify({ confirmDeletion: true }),
      });
      if (res.ok) {
        window.location.assign('/');
        return;
      }
      const json = await res.json().catch(() => ({}));
      setDeleteError(
        DELETE_ERRORS[json.error] ??
          'Não foi possível excluir a conta. Tente novamente.'
      );
    } catch {
      setDeleteError('Não foi possível excluir a conta. Tente novamente.');
    }
    setDeleting(false);
  };

  const closeDelete = (open: boolean) => {
    if (deleting) return;
    setDeleteOpen(open);
    if (!open) {
      setConfirmText('');
      setDeleteError(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Preferências">
        <Row
          id="pref-necessary"
          title="Necessários"
          description="Login, assinatura e segurança. Sempre ativos."
          control={
            <Switch
              id="pref-necessary"
              checked
              disabled
              aria-describedby="pref-necessary-desc"
            />
          }
        />
        {hasAnalytics && (
          <Row
            id="pref-analytics"
            title="Análise de uso"
            description="Google Analytics (como o site é usado) e Sentry (relatórios de erros do navegador). Vale para este navegador."
            control={
              <Switch
                id="pref-analytics"
                checked={analyticsConsent === 'granted'}
                disabled={analyticsConsent === 'loading'}
                onCheckedChange={(on) =>
                  writeConsent(on ? 'granted' : 'denied')
                }
                aria-describedby="pref-analytics-desc"
              />
            }
          />
        )}
        <Row
          id="pref-marketing"
          title="Novidades por e-mail"
          description="Novas atividades e ofertas. Só enviamos se você ativar."
          control={
            <Switch
              id="pref-marketing"
              checked={marketingOn}
              disabled={isLoading || marketingSaving || !csrfToken}
              onCheckedChange={setMarketing}
              aria-describedby="pref-marketing-desc"
            />
          }
        />
        {marketingError && (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {marketingError}
          </p>
        )}
      </Card>

      <Card title="Seus dados">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-neutral-900">Exportar</p>
            <p className="mt-0.5 mb-3 text-sm text-neutral-600">
              Baixe tudo o que guardamos sobre você em um arquivo JSON.
            </p>
            <Button
              variant="outline"
              className="h-10 border-neutral-300 text-sm font-semibold"
              onClick={exportData}
              disabled={exporting}
            >
              {exporting ? 'Preparando...' : 'Baixar meus dados'}
            </Button>
            {exportError && (
              <p role="alert" className="mt-2 text-sm text-destructive">
                {exportError}
              </p>
            )}
          </div>

          <div className="border-t border-neutral-200 pt-6">
            <p className="text-sm font-medium text-neutral-900">
              Corrigir dados
            </p>
            <p className="mt-0.5 mb-3 text-sm text-neutral-600">
              Algum dado seu está errado ou desatualizado? Conte o que precisa
              mudar. Para mudar o email da conta, use o menu da sua foto
              (Gerenciar conta).
            </p>
            <Label htmlFor="correction" className="sr-only">
              O que precisa ser corrigido
            </Label>
            <Textarea
              id="correction"
              value={correction}
              onChange={(e) => setCorrection(e.target.value)}
              maxLength={1000}
              placeholder="Diga qual informação está errada e qual é o valor correto"
              className="min-h-[88px]"
            />
            <Button
              variant="outline"
              className="mt-3 h-10 border-neutral-300 text-sm font-semibold"
              onClick={sendCorrection}
              disabled={correctionSending || correction.trim().length < 10}
            >
              {correctionSending ? 'Enviando...' : 'Enviar pedido'}
            </Button>
            {correctionMsg && (
              <p
                role={correctionMsg.ok ? 'status' : 'alert'}
                className={`mt-2 text-sm ${correctionMsg.ok ? 'text-neutral-700' : 'text-destructive'}`}
              >
                {correctionMsg.text}
              </p>
            )}
          </div>

          <div className="border-t border-neutral-200 pt-6">
            <p className="text-sm font-medium text-neutral-900">
              Excluir conta
            </p>
            <p className="mt-0.5 mb-3 text-sm text-neutral-600">
              Apaga a sua conta e todos os seus dados. Não dá para desfazer.
            </p>
            <Button
              className="h-10 bg-red-700 text-sm font-semibold text-white hover:bg-red-800"
              onClick={() => setDeleteOpen(true)}
            >
              Excluir conta
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Informações legais">
        <dl className="space-y-2.5 text-sm">
          <LegalRow
            term="Base legal"
            detail="Execução do contrato (conta e assinatura) e consentimento (comunicações opcionais)."
          />
          <LegalRow
            term="Seus direitos"
            detail="Acesso, correção, portabilidade, eliminação e revogação do consentimento (LGPD, art. 18)."
          />
          <LegalRow
            term="Retenção"
            detail="Guardamos seus dados enquanto a conta existir. Ao excluí-la, eles são apagados. Mantemos apenas estatísticas anônimas, como o total de downloads de cada atividade por mês, que não identificam ninguém. Registros de pagamento ficam com o processador de pagamentos pelo prazo que a lei exige."
          />
          <LegalRow
            term="Correção de dados"
            detail="Escreva para o encarregado de dados e informe o que deve ser corrigido."
          />
          <div className="flex gap-1.5">
            <dt className="font-medium text-neutral-900">Contato:</dt>
            <dd className="text-neutral-600">
              <a
                href={`mailto:${DPO_EMAIL}`}
                className="underline underline-offset-2"
              >
                {DPO_EMAIL}
              </a>
            </dd>
          </div>
          <LegalRow term="Prazo de resposta" detail={PRIVACY_RESPONSE_TIME} />
        </dl>
        <p className="mt-4 text-sm text-neutral-600">
          <Link
            href="/privacidade"
            className="underline underline-offset-2"
            target="_blank"
          >
            Política de privacidade
          </Link>
          {' · '}
          <Link
            href="/termos"
            className="underline underline-offset-2"
            target="_blank"
          >
            Termos de uso
          </Link>
        </p>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={closeDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir a sua conta?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-neutral-600">
                <p>
                  Vamos apagar a sua conta, o histórico de downloads e as suas
                  preferências. Você perde o acesso na hora. Só mantemos
                  contagens anônimas de downloads, que não identificam você.
                </p>
                {subscription?.data?.subscribed && (
                  <p className="font-medium text-neutral-900">
                    Sua assinatura será cancelada agora, sem reembolso do
                    período já pago.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-1.5">
            <Label
              htmlFor="delete-confirm"
              className="text-sm text-neutral-900"
            >
              Digite {DELETE_CONFIRMATION_WORD} para confirmar
            </Label>
            <Input
              id="delete-confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoComplete="off"
              disabled={deleting}
            />
          </div>

          {deleteError && (
            <p role="alert" className="text-sm text-destructive">
              {deleteError}
            </p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <Button
              className="bg-red-700 text-white hover:bg-red-800"
              disabled={
                deleting ||
                !csrfToken ||
                confirmText.trim().toUpperCase() !== DELETE_CONFIRMATION_WORD
              }
              onClick={deleteAccount}
            >
              {deleting ? 'Excluindo...' : 'Excluir conta'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function LegalRow({ term, detail }: { term: string; detail: string }) {
  return (
    <div className="flex flex-wrap gap-x-1.5">
      <dt className="font-medium text-neutral-900">{term}:</dt>
      <dd className="text-neutral-600">{detail}</dd>
    </div>
  );
}

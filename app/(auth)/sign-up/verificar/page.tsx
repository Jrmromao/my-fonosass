'use client';

import { completeMissingUsername } from '@/components/auth/username';
import { useClerk, useSignUp } from '@clerk/nextjs';
import { EmailLinkErrorCode, isEmailLinkError } from '@clerk/nextjs/errors';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type State = 'checking' | 'verified' | 'expired' | 'mismatch' | 'failed';

/** Clerk error code only (no email or token), for the browser console. */
function errorCode(err: unknown): string {
  if (err instanceof Error && isEmailLinkError(err)) return err.code;
  if (err && typeof err === 'object' && 'errors' in err) {
    const errors = (err as { errors?: { code?: string }[] }).errors;
    if (errors?.[0]?.code) return errors[0].code;
  }
  return err instanceof Error ? err.name : 'unknown';
}

/**
 * Opened from the sign-up confirmation email. Confirms the email; if this is
 * the same browser, finishes the sign-up and goes to the dashboard. If the
 * sign-up was started elsewhere, that tab/device continues on its own.
 */
export default function VerifyEmailLink() {
  const { handleEmailLinkVerification } = useClerk();
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [state, setState] = useState<State>('checking');
  const started = useRef(false);

  useEffect(() => {
    if (!isLoaded || started.current) return;
    started.current = true;

    (async () => {
      // 1. Confirm the email. Only failures here mean "not confirmed".
      try {
        await handleEmailLinkVerification(
          {
            redirectUrlComplete: '/dashboard',
            onVerifiedOnOtherDevice: () => setState('verified'),
          },
          // Stay on this page; we finish below so the username is filled in.
          async () => undefined
        );
      } catch (err) {
        console.error('[sign-up/verificar] email link:', errorCode(err));
        const code =
          err instanceof Error && isEmailLinkError(err) ? err.code : null;
        setState(
          code === EmailLinkErrorCode.Expired
            ? 'expired'
            : code === EmailLinkErrorCode.ClientMismatch
              ? 'mismatch'
              : 'failed'
        );
        return;
      }

      // 2. Email confirmed: finish the sign-up in this browser if possible.
      // If that fails, the email is still confirmed and the original tab
      // (or signing in) continues.
      try {
        const result = await completeMissingUsername(signUp);
        if (result.status === 'complete' && result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
          router.replace('/dashboard');
          return;
        }
      } catch (err) {
        console.error('[sign-up/verificar] finish sign-up:', errorCode(err));
      }
      setState('verified');
    })();
  }, [isLoaded, handleEmailLinkVerification, signUp, setActive, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-violet-100 px-4 text-neutral-900">
      <div className="max-w-sm text-center" role="status" aria-live="polite">
        {state === 'checking' && (
          <>
            <Loader2
              className="mx-auto mb-3 h-6 w-6 animate-spin text-neutral-600"
              aria-hidden
            />
            <p className="text-sm text-neutral-600">Confirmando seu email...</p>
          </>
        )}
        {state === 'verified' && (
          <>
            <p className="text-base font-semibold">Email confirmado.</p>
            <p className="mt-2 text-sm text-neutral-600">
              Volte para a aba onde você criou a conta. Ela continua sozinha.
            </p>
          </>
        )}
        {state === 'mismatch' && (
          <>
            <p className="text-base font-semibold">
              Abra o link no mesmo navegador.
            </p>
            <p className="mt-2 text-sm text-neutral-600">
              Por segurança, o link de confirmação só funciona no navegador onde
              você começou o cadastro. Copie o link do email e abra-o lá, ou
              peça um novo link na página de cadastro.
            </p>
            <Link
              href="/sign-up"
              className="mt-4 inline-block text-sm font-semibold underline underline-offset-4"
            >
              Voltar ao cadastro
            </Link>
          </>
        )}
        {(state === 'expired' || state === 'failed') && (
          <>
            <p className="text-base font-semibold">
              {state === 'expired'
                ? 'Este link expirou.'
                : 'Não foi possível confirmar o email.'}
            </p>
            <p className="mt-2 text-sm text-neutral-600">
              Peça um novo link na página de cadastro.
            </p>
            <Link
              href="/sign-up"
              className="mt-4 inline-block text-sm font-semibold underline underline-offset-4"
            >
              Voltar ao cadastro
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

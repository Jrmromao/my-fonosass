'use client';

import { completeMissingUsername } from '@/components/auth/username';
import { useSignUp } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/**
 * Google sign-ups land here when Clerk still needs a field. The only one we
 * expect is the username (required by the Clerk instance, never shown in
 * the app), so it is generated and the sign-up is completed.
 */
export default function CompleteSignUp() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!isLoaded || started.current) return;
    started.current = true;

    (async () => {
      try {
        const result = await completeMissingUsername(signUp);
        if (result.status === 'complete' && result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
          router.replace('/dashboard');
          return;
        }
        console.error('Sign-up incomplete, missing:', result.missingFields);
      } catch (err) {
        console.error('Could not complete sign-up:', err);
      }
      setFailed(true);
    })();
  }, [isLoaded, signUp, setActive, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-violet-100 px-4 text-neutral-900">
      <div className="max-w-sm text-center" role="status" aria-live="polite">
        {failed ? (
          <>
            <p className="text-base font-semibold">
              Não foi possível concluir o cadastro.
            </p>
            <p className="mt-2 text-sm text-neutral-600">
              Tente de novo. Se o problema continuar,{' '}
              <Link href="/contato" className="underline underline-offset-4">
                fale conosco
              </Link>
              .
            </p>
            <Link
              href="/sign-up"
              className="mt-4 inline-block text-sm font-semibold underline underline-offset-4"
            >
              Voltar ao cadastro
            </Link>
          </>
        ) : (
          <>
            <Loader2
              className="mx-auto mb-3 h-6 w-6 animate-spin text-neutral-600"
              aria-hidden
            />
            <p className="text-sm text-neutral-600">
              Concluindo seu cadastro...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

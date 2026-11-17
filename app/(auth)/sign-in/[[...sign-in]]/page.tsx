import AuthShell, { linkClass } from '@/components/auth/AuthShell';
import CustomSignInForm from '@/components/auth/CustomSignInForm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Entrar',
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <AuthShell
      title="Entrar"
      description="Acesse sua conta para baixar as atividades da biblioteca."
      footer={
        <>
          Ainda não tem conta?{' '}
          <Link href="/sign-up" className={linkClass}>
            Criar conta
          </Link>
        </>
      }
    >
      {/* useSearchParams (redirect_url) needs a Suspense boundary. */}
      <Suspense>
        <CustomSignInForm />
      </Suspense>
    </AuthShell>
  );
}

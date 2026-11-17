import AuthShell, { linkClass } from '@/components/auth/AuthShell';
import CustomSignUpForm from '@/components/auth/CustomSignUpForm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Criar conta',
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <AuthShell
      title="Criar conta"
      description="Acesse a biblioteca de atividades de fonoaudiologia."
      footer={
        <>
          Já tem uma conta?{' '}
          <Link href="/sign-in" className={linkClass}>
            Entrar
          </Link>
        </>
      }
    >
      {/* useSearchParams (redirect_url) needs a Suspense boundary. */}
      <Suspense>
        <CustomSignUpForm />
      </Suspense>
    </AuthShell>
  );
}

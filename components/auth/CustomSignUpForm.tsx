'use client';

import '@/lib/zodConfig'; // before any schema is built: no eval probe (CSP)

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSignUp } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, AlertDescription } from '../ui/alert';
import { inputClass, linkClass, primaryButtonClass } from './AuthShell';
import { clerkErrorMessage } from './clerkErrors';
import EmailInput from './EmailInput';
import GoogleButton, { OrDivider } from './GoogleButton';
import PasswordInput from './PasswordInput';
import { PASSWORD_HINT, passwordSchema } from './passwordRules';
import { safeRedirectTarget } from './redirect';
import { completeMissingUsername } from './username';

// No "confirm password" field: the show/hide toggle lets users check what they
// typed, and the reset flow covers typos. One field less to fill in.
const signUpSchema = z.object({
  firstName: z.string().trim().min(2, 'Informe seu nome.'),
  lastName: z.string().trim().min(2, 'Informe seu sobrenome.'),
  email: z.string().trim().email('Informe um email válido.'),
  password: passwordSchema,
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function CustomSignUpForm() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  // How Clerk verifies the email for this instance: a 6-digit code or a link.
  const [method, setMethod] = useState<'code' | 'link'>('code');
  const cancelLinkFlow = useRef<(() => void) | null>(null);
  useEffect(() => () => cancelLinkFlow.current?.(), []);
  const [code, setCode] = useState('');
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>(
    'idle'
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const target = () => safeRedirectTarget(searchParams.get('redirect_url'));

  const onSubmit = async (data: SignUpFormData) => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await signUp.create({
        emailAddress: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      // Clerk requires a username we never ask for: fill it in if missing.
      const withUsername = await completeMissingUsername(result, data.email);

      if (withUsername.status === 'complete') {
        await setActive({ session: withUsername.createdSessionId });
        router.push(target());
        return;
      }

      // Email needs verification. Use what the Clerk instance allows: both
      // instances currently only allow the email link, not the code.
      const strategies =
        withUsername.verifications.emailAddress.supportedStrategies ?? [];
      setPendingEmail(data.email);
      if (strategies.includes('email_code')) {
        await signUp.prepareEmailAddressVerification({
          strategy: 'email_code',
        });
        setMethod('code');
      } else {
        setMethod('link');
        setIsLoading(false);
        await waitForEmailLink();
      }
    } catch (err: unknown) {
      setError(
        clerkErrorMessage(
          err,
          'Não foi possível criar a conta. Tente novamente.'
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError(null);

    try {
      const verified = await signUp.attemptEmailAddressVerification({ code });
      const result = await completeMissingUsername(verified);

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push(target());
      } else {
        // Something other than the username is still missing.
        console.error('Sign-up incomplete, missing:', result.missingFields);
        setError('Não foi possível concluir o cadastro. Tente novamente.');
      }
    } catch (err: unknown) {
      setError(
        clerkErrorMessage(err, 'Código incorreto. Confira e tente novamente.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Sends the link and waits (Clerk polls) until it is opened, in this
  // browser or another device, then signs the user in here.
  const waitForEmailLink = async () => {
    if (!isLoaded) return;
    cancelLinkFlow.current?.();
    const { startEmailLinkFlow, cancelEmailLinkFlow } =
      signUp.createEmailLinkFlow();
    cancelLinkFlow.current = cancelEmailLinkFlow;
    try {
      const verified = await startEmailLinkFlow({
        redirectUrl: `${window.location.origin}/sign-up/verificar`,
      });
      const result = await completeMissingUsername(verified);
      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        router.push(target());
      } else if (verified.verifications.emailAddress.status === 'expired') {
        setError('O link expirou. Envie um novo link.');
      }
    } catch (err: unknown) {
      setError(
        clerkErrorMessage(err, 'Não foi possível confirmar o email agora.')
      );
    } finally {
      cancelLinkFlow.current = null;
    }
  };

  const resendLink = () => {
    setError(null);
    setResendState('sent');
    void waitForEmailLink();
  };

  const resendCode = async () => {
    if (!isLoaded) return;
    setResendState('sending');
    setError(null);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setResendState('sent');
    } catch (err: unknown) {
      setResendState('idle');
      setError(
        clerkErrorMessage(err, 'Não foi possível reenviar o código agora.')
      );
    }
  };

  const handleGoogleSignUp = async () => {
    if (!isLoaded) return;

    setIsGoogleLoading(true);
    setError(null);

    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: target(),
      });
    } catch (err: unknown) {
      setError(
        clerkErrorMessage(
          err,
          'Não foi possível continuar com o Google. Tente novamente.'
        )
      );
      setIsGoogleLoading(false);
    }
  };

  const busy = isLoading || isGoogleLoading;

  const useOtherEmail = () => {
    cancelLinkFlow.current?.();
    setPendingEmail(null);
    setCode('');
    setError(null);
    setResendState('idle');
  };

  if (pendingEmail && method === 'link') {
    return (
      <div className="space-y-4" aria-live="polite">
        <p className="text-sm text-neutral-600 leading-relaxed">
          Enviamos um link de confirmação para{' '}
          <span className="font-semibold text-neutral-900">{pendingEmail}</span>
          . Abra o email e clique no link. Esta página continua sozinha depois
          disso. Confira também a caixa de spam.
        </p>

        {error && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Aguardando a confirmação...
        </div>

        <div className="flex flex-col items-center gap-2 pt-2 text-sm text-neutral-600">
          <p>
            {resendState === 'sent' ? (
              'Enviamos um novo link.'
            ) : (
              <>
                Não recebeu?{' '}
                <button
                  type="button"
                  onClick={resendLink}
                  className={linkClass}
                >
                  Reenviar link
                </button>
              </>
            )}
          </p>
          <button
            type="button"
            onClick={useOtherEmail}
            className="text-neutral-600 underline underline-offset-4 hover:text-neutral-900"
          >
            Usar outro email
          </button>
        </div>
      </div>
    );
  }

  if (pendingEmail) {
    return (
      <form onSubmit={onVerify} className="space-y-4" noValidate>
        <p className="text-sm text-neutral-600 leading-relaxed">
          Enviamos um código de 6 dígitos para{' '}
          <span className="font-semibold text-neutral-900">{pendingEmail}</span>
          . Confira também a caixa de spam.
        </p>

        {error && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="code">Código de verificação</Label>
          <Input
            id="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            maxLength={6}
            autoFocus
            className={`${inputClass} text-center font-mono text-lg tracking-[0.4em]`}
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading || code.length !== 6}
          className={primaryButtonClass}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Verificando...
            </>
          ) : (
            'Confirmar e entrar'
          )}
        </Button>

        <div className="flex flex-col items-center gap-2 pt-2 text-sm text-neutral-600">
          <p aria-live="polite">
            {resendState === 'sent' ? (
              'Enviamos um novo código.'
            ) : (
              <>
                Não recebeu?{' '}
                <button
                  type="button"
                  onClick={resendCode}
                  disabled={resendState === 'sending'}
                  className={linkClass}
                >
                  {resendState === 'sending'
                    ? 'Reenviando...'
                    : 'Reenviar código'}
                </button>
              </>
            )}
          </p>
          <button
            type="button"
            onClick={useOtherEmail}
            className="text-neutral-600 underline underline-offset-4 hover:text-neutral-900"
          >
            Usar outro email
          </button>
        </div>
      </form>
    );
  }

  return (
    <div>
      {error && (
        <Alert variant="destructive" className="mb-5" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <GoogleButton
        onClick={handleGoogleSignUp}
        disabled={busy}
        loading={isGoogleLoading}
      />

      <OrDivider />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="firstName" label="Nome" error={errors.firstName?.message}>
            <Input
              id="firstName"
              type="text"
              autoComplete="given-name"
              aria-invalid={!!errors.firstName}
              aria-describedby={
                errors.firstName ? 'firstName-error' : undefined
              }
              className={inputClass}
              {...register('firstName')}
            />
          </Field>
          <Field
            id="lastName"
            label="Sobrenome"
            error={errors.lastName?.message}
          >
            <Input
              id="lastName"
              type="text"
              autoComplete="family-name"
              aria-invalid={!!errors.lastName}
              aria-describedby={errors.lastName ? 'lastName-error' : undefined}
              className={inputClass}
              {...register('lastName')}
            />
          </Field>
        </div>

        <Field id="email" label="Email" error={errors.email?.message}>
          <EmailInput
            id="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
        </Field>

        <Field
          id="password"
          label="Senha"
          error={errors.password?.message}
          hint={PASSWORD_HINT}
        >
          <PasswordInput
            id="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? 'password-error' : 'password-hint'
            }
            {...register('password')}
          />
        </Field>

        {/* Clerk's bot protection (Cloudflare Turnstile) renders here. */}
        <div id="clerk-captcha" />

        <Button type="submit" disabled={busy} className={primaryButtonClass}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Criando conta...
            </>
          ) : (
            'Criar conta'
          )}
        </Button>

        <p className="text-xs text-neutral-600 leading-relaxed">
          Ao criar sua conta, você concorda com os{' '}
          <Link href="/termos" className="underline underline-offset-2">
            Termos de Uso
          </Link>{' '}
          e com a{' '}
          <Link href="/privacidade" className="underline underline-offset-2">
            Política de Privacidade
          </Link>
          .
        </p>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-xs text-neutral-600">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

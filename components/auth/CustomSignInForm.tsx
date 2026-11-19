'use client';

import '@/lib/zodConfig'; // before any schema is built: no eval probe (CSP)

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSignIn } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
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

const signInSchema = z.object({
  email: z.string().trim().email('Informe um email válido.'),
  password: z.string().min(1, 'Informe sua senha.'),
});

type SignInFormData = z.infer<typeof signInSchema>;

type Mode = 'sign-in' | 'reset-request' | 'reset-verify';

export default function CustomSignInForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password reset state
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetFieldError, setResetFieldError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const target = () => safeRedirectTarget(searchParams.get('redirect_url'));

  const onSubmit = async (data: SignInFormData) => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push(target());
      } else {
        setError('Não foi possível concluir o login. Tente novamente.');
      }
    } catch (err: unknown) {
      setError(
        clerkErrorMessage(
          err,
          'Não foi possível entrar. Confira seu email e sua senha.'
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;

    setIsGoogleLoading(true);
    setError(null);

    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: target(),
      });
    } catch (err: unknown) {
      setError(
        clerkErrorMessage(
          err,
          'Não foi possível entrar com o Google. Tente novamente.'
        )
      );
      setIsGoogleLoading(false);
    }
  };

  const startReset = () => {
    setError(null);
    setResetFieldError(null);
    setResetEmail(getValues('email') ?? '');
    setMode('reset-request');
  };

  const backToSignIn = () => {
    setError(null);
    setResetFieldError(null);
    setResetCode('');
    setNewPassword('');
    setMode('sign-in');
  };

  const sendResetCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isLoaded) return;

    const parsed = z.string().trim().email().safeParse(resetEmail);
    if (!parsed.success) {
      setResetFieldError('Informe um email válido.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResetFieldError(null);

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: parsed.data,
      });
      setMode('reset-verify');
    } catch (err: unknown) {
      setError(
        clerkErrorMessage(err, 'Não foi possível enviar o código agora.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const confirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    const parsed = passwordSchema.safeParse(newPassword);
    if (!parsed.success) {
      setResetFieldError(PASSWORD_HINT);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResetFieldError(null);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: resetCode,
        password: parsed.data,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push(target());
      } else {
        setError('Não foi possível concluir a redefinição. Tente novamente.');
      }
    } catch (err: unknown) {
      setError(
        clerkErrorMessage(err, 'Código incorreto. Confira e tente novamente.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const busy = isLoading || isGoogleLoading;

  const errorAlert = error && (
    <Alert variant="destructive" className="mb-5" role="alert">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );

  if (mode === 'reset-request') {
    return (
      <form onSubmit={sendResetCode} className="space-y-4" noValidate>
        <BackLink onClick={backToSignIn} />
        <div>
          <h2 className="font-semibold text-neutral-900">Redefinir senha</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Informe o email da sua conta. Vamos enviar um código para criar uma
            nova senha.
          </p>
        </div>
        {errorAlert}
        <div className="space-y-1.5">
          <Label htmlFor="reset-email">Email</Label>
          <EmailInput
            id="reset-email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            aria-invalid={!!resetFieldError}
            aria-describedby={resetFieldError ? 'reset-email-error' : undefined}
            autoFocus
          />
          {resetFieldError && (
            <p id="reset-email-error" className="text-sm text-destructive">
              {resetFieldError}
            </p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className={primaryButtonClass}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Enviando...
            </>
          ) : (
            'Enviar código'
          )}
        </Button>
      </form>
    );
  }

  if (mode === 'reset-verify') {
    return (
      <form onSubmit={confirmReset} className="space-y-4" noValidate>
        <BackLink onClick={backToSignIn} />
        <div>
          <h2 className="font-semibold text-neutral-900">Criar nova senha</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Enviamos um código de 6 dígitos para{' '}
            <span className="font-semibold text-neutral-900">{resetEmail}</span>
            . Confira também a caixa de spam.
          </p>
        </div>
        {errorAlert}
        <div className="space-y-1.5">
          <Label htmlFor="reset-code">Código</Label>
          <Input
            id="reset-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            placeholder="000000"
            maxLength={6}
            value={resetCode}
            onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
            autoFocus
            className={`${inputClass} text-center font-mono text-lg tracking-[0.4em]`}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-password">Nova senha</Label>
          <PasswordInput
            id="new-password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            aria-invalid={!!resetFieldError}
            aria-describedby="new-password-hint"
          />
          <p
            id="new-password-hint"
            className={`text-xs ${resetFieldError ? 'text-destructive' : 'text-neutral-600'}`}
          >
            {PASSWORD_HINT}
          </p>
        </div>
        <Button
          type="submit"
          disabled={isLoading || resetCode.length !== 6}
          className={primaryButtonClass}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Salvando...
            </>
          ) : (
            'Salvar nova senha e entrar'
          )}
        </Button>
        <p className="text-center text-sm text-neutral-600">
          Não recebeu?{' '}
          <button
            type="button"
            onClick={() => sendResetCode()}
            disabled={isLoading}
            className={linkClass}
          >
            Reenviar código
          </button>
        </p>
      </form>
    );
  }

  return (
    <div>
      {errorAlert}

      <GoogleButton
        onClick={handleGoogleSignIn}
        disabled={busy}
        loading={isGoogleLoading}
      />

      <OrDivider />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <EmailInput
            id="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-4">
            <Label htmlFor="password">Senha</Label>
            <button
              type="button"
              onClick={startReset}
              className="text-sm text-neutral-600 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-900 hover:decoration-neutral-900"
            >
              Esqueci minha senha
            </button>
          </div>
          <PasswordInput
            id="password"
            placeholder="Sua senha"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
          {errors.password && (
            <p id="password-error" className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" disabled={busy} className={primaryButtonClass}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </Button>
      </form>
    </div>
  );
}

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900"
    >
      <ArrowLeft size={16} aria-hidden />
      Voltar para o login
    </button>
  );
}

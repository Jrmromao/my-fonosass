'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSignIn } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, AlertDescription } from '../ui/alert';

const signInSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function CustomSignInForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

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
        router.push('/dashboard');
      } else {
        setError('Falha na autenticação. Tente novamente.');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(
        err.errors?.[0]?.message ||
          'Erro ao fazer login. Verifique suas credenciais.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError(null);

    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard',
      });
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setError('Erro ao fazer login com Google. Tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Bem-vindo de volta
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Entre na sua conta para gerenciar seus exercícios de fonoaudiologia
        </p>
      </div>
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              {...register('email')}
              className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-pink-500 focus:ring-pink-500/20"
            />
            {errors.email && (
              <p className="text-sm text-red-500 dark:text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-gray-700 dark:text-gray-300"
            >
              Senha
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Sua senha"
                autoComplete="current-password"
                {...register('password')}
                className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-pink-500 focus:ring-pink-500/20 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 dark:text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-yellow-400 hover:shadow-lg hover:shadow-pink-500/20 transition-all text-white font-semibold py-2 rounded-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
              Ou continue com
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Continuar com Google
        </Button>

        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Não tem uma conta?{' '}
            <a
              href="/sign-up"
              className="text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300 font-medium"
            >
              Cadastre-se agora
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

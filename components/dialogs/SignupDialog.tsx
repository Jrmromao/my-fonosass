'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowRight, Check, Mail, X } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { Input } from '../ui/input';

interface SignupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: 'balloon' | 'feature' | 'cta';
}

export default function SignupDialog({
  isOpen,
  onClose,
  trigger = 'balloon',
}: SignupDialogProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/waiting-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setEmail('');
      } else {
        const data = await response.json();
        setError(data.error || 'Erro ao adicionar email à lista de espera');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Concrete, honest product facts — no hype, no fake numbers.
  const benefits = [
    'Atividades imprimíveis organizadas por fonema',
    'Criadas e revisadas por fonoaudióloga clínica',
    'Novos materiais adicionados toda semana',
  ];

  const getTriggerCopy = () => {
    switch (trigger) {
      case 'balloon':
        return {
          title: 'Esta função está chegando',
          subtitle:
            'Deixe seu email e avisaremos assim que os balões interativos estiverem disponíveis.',
          cta: 'Entrar na lista de espera',
        };
      case 'feature':
        return {
          title: 'Ainda em desenvolvimento',
          subtitle:
            'Deixe seu email para ser avisado quando esta funcionalidade for lançada.',
          cta: 'Quero ser avisado',
        };
      default:
        return {
          title: 'O Almanaque da Fala está chegando',
          subtitle:
            'Deixe seu email e avisaremos assim que a biblioteca estiver disponível.',
          cta: 'Entrar na lista de espera',
        };
    }
  };

  const copy = getTriggerCopy();

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-neutral-900/60 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-10 h-10 rounded-full bg-coral-500/10 border border-coral-500/20 flex items-center justify-center mb-3">
              <Check className="h-5 w-5 text-coral-600" />
            </div>
            <CardTitle className="text-xl font-bold text-neutral-900 font-display">
              Pronto, você está na lista
            </CardTitle>
            <p className="text-sm text-neutral-600 mt-1">
              Avisaremos no seu email assim que a biblioteca estiver disponível.
            </p>
          </CardHeader>
          <CardContent>
            <Button
              onClick={onClose}
              className="w-full bg-coral-500 hover:bg-coral-600 text-white"
            >
              Fechar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-neutral-900/60 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-4">
            <div>
              <p className="text-xs text-coral-600 font-medium uppercase tracking-wide mb-2">
                Lista de espera
              </p>
              <CardTitle className="text-2xl font-bold text-neutral-900 font-display mb-1.5">
                {copy.title}
              </CardTitle>
              <p className="text-sm text-neutral-500 leading-relaxed">
                {copy.subtitle}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="shrink-0 h-8 w-8 flex items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* What you get — concrete, no hype, no decorative icons */}
          <ul className="space-y-2.5 border-l-2 border-coral-500/30 pl-4">
            {benefits.map((benefit, index) => (
              <li
                key={index}
                className="text-sm text-neutral-600 leading-relaxed"
              >
                {benefit}
              </li>
            ))}
          </ul>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                type="email"
                placeholder="Seu email profissional"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11 bg-white border-neutral-200"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-coral-500 hover:bg-coral-600 text-white font-medium"
              disabled={isSubmitting || !email}
            >
              {isSubmitting ? (
                'Adicionando...'
              ) : (
                <>
                  {copy.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>

          <p className="text-xs text-neutral-400 text-center">
            Usamos seu email apenas para avisar sobre o lançamento. Sem spam.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

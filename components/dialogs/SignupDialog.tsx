'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Mail,
  Rocket,
  Shield,
  Users,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
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
        headers: {
          'Content-Type': 'application/json',
        },
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

  const benefits = [
    {
      icon: Rocket,
      title: 'Revolução na Fonoaudiologia',
      description:
        'A primeira plataforma completa desenvolvida especificamente para fonoaudiólogos brasileiros',
    },
    {
      icon: Shield,
      title: '100% LGPD Compliant',
      description:
        'Prontuários digitais seguros e em conformidade com a legislação',
    },
    {
      icon: Users,
      title: 'Comunidade Exclusiva',
      description: 'Conecte-se com centenas de fonoaudiólogos em todo o Brasil',
    },
  ];

  const getTriggerCopy = () => {
    switch (trigger) {
      case 'balloon':
        return {
          title: '🎈 Quer estourar balões?',
          subtitle:
            'Junte-se à nossa lista de espera e seja o primeiro a testar esta funcionalidade incrível!',
          cta: 'Entrar na Lista de Espera',
        };
      case 'feature':
        return {
          title: '🚀 Estamos construindo algo incrível!',
          subtitle:
            'Seja notificado quando lançarmos a plataforma completa para fonoaudiólogos',
          cta: 'Quero ser Notificado',
        };
      default:
        return {
          title: '🎯 Almanaque da Fala está chegando!',
          subtitle:
            'A revolução na fonoaudiologia brasileira está sendo construída',
          cta: 'Entrar na Lista de Espera',
        };
    }
  };

  const copy = getTriggerCopy();

  // Show success state
  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              🎉 Você está na lista!
            </CardTitle>
            <p className="text-gray-600">
              Obrigado! Te avisaremos assim que o Almanaque da Fala estiver
              pronto.
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={onClose} className="w-full">
              Fechar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                {copy.title}
              </CardTitle>
              <p className="text-gray-600 text-lg">{copy.subtitle}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="ml-4 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="text-center p-4 bg-gray-50 rounded-lg"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full mb-3">
                  <benefit.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>

          {/* Social Proof */}
          {/* <div className="text-center py-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
            </div>
            <p className="text-sm text-green-800 font-medium">
              "Revolucionou minha prática clínica!" - Dr. Maria Silva
            </p>
            <p className="text-xs text-green-600 mt-1">
              +500 fonoaudiólogos já confiam na nossa plataforma
            </p>
          </div> */}

          {/* Waiting List Form */}
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center">
                <div className="relative max-w-md mx-auto">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Seu melhor email profissional"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 text-lg"
                    required
                  />
                </div>
              </div>

              <div className="text-center">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg py-6"
                  disabled={isSubmitting || !email}
                >
                  {isSubmitting ? (
                    'Adicionando à lista...'
                  ) : (
                    <>
                      {copy.cta}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Grátis para começar</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Cancelamento livre</span>
            </div>
          </div>

          {/* Urgency/Scarcity */}
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <Badge
              variant="secondary"
              className="mb-2 bg-orange-100 text-orange-800"
            >
              🚀 Lançamento em Breve
            </Badge>
            <p className="text-sm text-orange-800 font-medium">
              Primeiros 10 da lista de espera ganham acesso gratuito vitalício!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

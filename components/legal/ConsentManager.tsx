'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Shield, Settings, BarChart3, Target, AlertCircle, CheckCircle } from 'lucide-react';

interface ConsentPreferences {
  essential: boolean;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
}

interface ConsentManagerProps {
  onConsentChange: (preferences: ConsentPreferences) => void;
  initialPreferences?: ConsentPreferences;
}

export default function ConsentManager({ onConsentChange, initialPreferences }: ConsentManagerProps) {
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    essential: true, // Always true
    analytics: false,
    functional: false,
    marketing: false,
    ...initialPreferences
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already set preferences
    const storedPreferences = localStorage.getItem('consent-preferences');
    if (storedPreferences) {
      const parsed = JSON.parse(storedPreferences);
      setPreferences(parsed);
      onConsentChange(parsed);
    } else {
      // Show consent banner if no preferences stored
      setIsOpen(true);
    }
  }, [onConsentChange]);

  const handlePreferenceChange = (key: keyof ConsentPreferences, value: boolean) => {
    if (key === 'essential') return; // Essential cookies cannot be disabled
    
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    onConsentChange(newPreferences);
    
    // Save to localStorage
    localStorage.setItem('consent-preferences', JSON.stringify(newPreferences));
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      functional: true,
      marketing: true
    };
    setPreferences(allAccepted);
    onConsentChange(allAccepted);
    localStorage.setItem('consent-preferences', JSON.stringify(allAccepted));
    setIsOpen(false);
  };

  const handleRejectAll = () => {
    const rejected = {
      essential: true, // Always true
      analytics: false,
      functional: false,
      marketing: false
    };
    setPreferences(rejected);
    onConsentChange(rejected);
    localStorage.setItem('consent-preferences', JSON.stringify(rejected));
    setIsOpen(false);
  };

  const handleSavePreferences = () => {
    onConsentChange(preferences);
    localStorage.setItem('consent-preferences', JSON.stringify(preferences));
    setIsOpen(false);
  };

  const cookieTypes = [
    {
      key: 'essential' as keyof ConsentPreferences,
      title: 'Cookies Essenciais',
      description: 'Necessários para o funcionamento básico do site e segurança.',
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      required: true
    },
    {
      key: 'analytics' as keyof ConsentPreferences,
      title: 'Cookies Analíticos',
      description: 'Coletam informações sobre como você usa nosso site para melhorias.',
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      required: false
    },
    {
      key: 'functional' as keyof ConsentPreferences,
      title: 'Cookies Funcionais',
      description: 'Melhoram a funcionalidade e personalização do site.',
      icon: Settings,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      required: false
    },
    {
      key: 'marketing' as keyof ConsentPreferences,
      title: 'Cookies de Marketing',
      description: 'Usados para exibir anúncios relevantes e medir campanhas.',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      required: false
    }
  ];

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Settings className="h-4 w-4 mr-2" />
        Configurar Cookies
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Configurações de Cookies
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Gerencie suas preferências de cookies para personalizar sua experiência no Almanaque da Fala.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Cookie Types */}
          <div className="space-y-4">
            {cookieTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div key={type.key} className={`p-4 rounded-lg border ${type.bgColor}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${type.color}`} />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {type.title}
                          {type.required && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Obrigatório
                            </Badge>
                          )}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {type.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences[type.key]}
                      onCheckedChange={(checked) => handlePreferenceChange(type.key, checked)}
                      disabled={type.required}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Information */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Informações Importantes:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Cookies essenciais são necessários para o funcionamento do site</li>
                  <li>• Você pode alterar suas preferências a qualquer momento</li>
                  <li>• Desabilitar cookies pode afetar a funcionalidade do site</li>
                  <li>• Suas preferências são salvas localmente no seu dispositivo</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={handleRejectAll}
              className="flex-1"
            >
              Rejeitar Todos
            </Button>
            <Button
              variant="outline"
              onClick={handleSavePreferences}
              className="flex-1"
            >
              Salvar Preferências
            </Button>
            <Button
              onClick={handleAcceptAll}
              className="flex-1"
            >
              Aceitar Todos
            </Button>
          </div>

          {/* Links */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>
              Para mais informações, consulte nossa{' '}
              <a href="/privacidade" className="text-blue-600 hover:underline">
                Política de Privacidade
              </a>{' '}
              e{' '}
              <a href="/cookies" className="text-blue-600 hover:underline">
                Política de Cookies
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { ConsentPreferences } from '@/lib/services/consentService';
import { useUser } from '@clerk/nextjs';
import {
  Activity,
  AlertCircle,
  BarChart3,
  Bot,
  Brain,
  CheckCircle,
  Database,
  Eye,
  EyeOff,
  Mail,
  Settings,
  Share2,
  Shield,
  Target,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface EnhancedConsentManagerProps {
  onConsentChange?: (preferences: ConsentPreferences) => void;
  initialPreferences?: ConsentPreferences;
  showAuditTrail?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

export default function EnhancedConsentManager({
  onConsentChange,
  initialPreferences,
  showAuditTrail = false,
  isOpen = false,
  onClose,
  onOpen,
}: EnhancedConsentManagerProps) {
  const { user } = useUser();
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    dataProcessing: true, // Required for service
    marketingCommunications: false,
    analyticsTracking: false,
    thirdPartySharing: false,
    cookiesEssential: true, // Required
    cookiesAnalytics: false,
    cookiesFunctional: false,
    cookiesMarketing: false,
    profiling: false,
    automatedDecisionMaking: false,
    ...initialPreferences,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});

  const loadConsentStatus = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/consent/status');
      const data = await response.json();

      if (data.success) {
        setAuditTrail(data.data);

        // Update preferences based on current consent records
        const updatedPreferences: ConsentPreferences = { ...preferences };

        data.data.forEach((record: any) => {
          switch (record.consentType) {
            case 'DATA_PROCESSING':
              updatedPreferences.dataProcessing = record.granted;
              break;
            case 'MARKETING_COMMUNICATIONS':
              updatedPreferences.marketingCommunications = record.granted;
              break;
            case 'ANALYTICS_TRACKING':
              updatedPreferences.analyticsTracking = record.granted;
              break;
            case 'THIRD_PARTY_SHARING':
              updatedPreferences.thirdPartySharing = record.granted;
              break;
            case 'COOKIES_ESSENTIAL':
              updatedPreferences.cookiesEssential = record.granted;
              break;
            case 'COOKIES_ANALYTICS':
              updatedPreferences.cookiesAnalytics = record.granted;
              break;
            case 'COOKIES_FUNCTIONAL':
              updatedPreferences.cookiesFunctional = record.granted;
              break;
            case 'COOKIES_MARKETING':
              updatedPreferences.cookiesMarketing = record.granted;
              break;
            case 'PROFILING':
              updatedPreferences.profiling = record.granted;
              break;
            case 'AUTOMATED_DECISION_MAKING':
              updatedPreferences.automatedDecisionMaking = record.granted;
              break;
          }
        });

        setPreferences(updatedPreferences);
      } else {
        console.error('Error loading consent status:', data.message);
        setAuditTrail([]);
      }
    } catch (error) {
      console.error('Error loading consent status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o status de consentimento.',
        variant: 'destructive',
      });
    }
  }, [user?.id, preferences]);

  useEffect(() => {
    if (user?.id && showAuditTrail) {
      loadConsentStatus();
    }
  }, [user?.id, showAuditTrail, loadConsentStatus]);

  const handlePreferenceChange = useCallback(
    async (key: keyof ConsentPreferences, value: boolean) => {
      if (key === 'dataProcessing' || key === 'cookiesEssential') {
        return; // These cannot be disabled
      }

      const newPreferences = { ...preferences, [key]: value };
      setPreferences(newPreferences);

      if (onConsentChange) {
        onConsentChange(newPreferences);
      }

      // Save to database if user is authenticated
      if (user?.id) {
        setIsLoading(true);
        try {
          const response = await fetch('/api/consent/record', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ preferences: newPreferences }),
          });

          const data = await response.json();
          if (!data.success) {
            throw new Error(data.message || 'Failed to record consent');
          }

          toast({
            title: 'Preferências salvas',
            description:
              'Suas preferências de consentimento foram atualizadas com sucesso.',
          });
        } catch (error) {
          console.error('Error saving consent:', error);
          toast({
            title: 'Erro',
            description: 'Não foi possível salvar suas preferências.',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      }
    },
    [user?.id, preferences, onConsentChange]
  );

  const handleWithdrawConsent = async (consentType: string) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/consent/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consentType,
          reason: 'Usuário retirou consentimento via painel',
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to withdraw consent');
      }

      await loadConsentStatus();

      toast({
        title: 'Consentimento retirado',
        description: 'O consentimento foi retirado com sucesso.',
      });
    } catch (error) {
      console.error('Error withdrawing consent:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível retirar o consentimento.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDetails = (key: string) => {
    setShowDetails((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const consentTypes = [
    {
      key: 'dataProcessing' as keyof ConsentPreferences,
      title: 'Processamento de Dados Pessoais',
      description: 'Necessário para prestação dos serviços de fonoaudiologia.',
      icon: Database,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      required: true,
      legalBasis: 'Consentimento',
      dataCategories: [
        'Dados pessoais',
        'Informações de contato',
        'Dados de uso',
      ],
      thirdParties: [],
      retentionPeriod: '2 anos',
    },
    {
      key: 'marketingCommunications' as keyof ConsentPreferences,
      title: 'Comunicações de Marketing',
      description:
        'Envio de newsletters, ofertas e atualizações sobre nossos serviços.',
      icon: Mail,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      required: false,
      legalBasis: 'Consentimento',
      dataCategories: ['Informações de contato', 'Preferências'],
      thirdParties: ['Provedor de email'],
      retentionPeriod: '1 ano',
    },
    {
      key: 'analyticsTracking' as keyof ConsentPreferences,
      title: 'Rastreamento Analítico',
      description:
        'Coleta de dados para melhorar nossos serviços e experiência do usuário.',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      required: false,
      legalBasis: 'Interesse legítimo',
      dataCategories: ['Dados de uso', 'Informações do dispositivo'],
      thirdParties: ['Google Analytics'],
      retentionPeriod: '3 anos',
    },
    {
      key: 'thirdPartySharing' as keyof ConsentPreferences,
      title: 'Compartilhamento com Terceiros',
      description:
        'Compartilhamento de dados com provedores de serviços essenciais.',
      icon: Share2,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      required: false,
      legalBasis: 'Consentimento',
      dataCategories: ['Dados pessoais', 'Dados de uso'],
      thirdParties: ['Stripe', 'AWS', 'Clerk'],
      retentionPeriod: '2 anos',
    },
    {
      key: 'cookiesEssential' as keyof ConsentPreferences,
      title: 'Cookies Essenciais',
      description:
        'Necessários para o funcionamento básico do site e segurança.',
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      required: true,
      legalBasis: 'Interesse legítimo',
      dataCategories: ['Dados de sessão'],
      thirdParties: [],
      retentionPeriod: '30 dias',
    },
    {
      key: 'cookiesAnalytics' as keyof ConsentPreferences,
      title: 'Cookies Analíticos',
      description: 'Coletam informações sobre como você usa nosso site.',
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      required: false,
      legalBasis: 'Consentimento',
      dataCategories: ['Dados de uso', 'Informações do dispositivo'],
      thirdParties: ['Google Analytics'],
      retentionPeriod: '2 anos',
    },
    {
      key: 'cookiesFunctional' as keyof ConsentPreferences,
      title: 'Cookies Funcionais',
      description: 'Melhoram a funcionalidade e personalização do site.',
      icon: Settings,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      required: false,
      legalBasis: 'Consentimento',
      dataCategories: ['Preferências', 'Configurações'],
      thirdParties: [],
      retentionPeriod: '1 ano',
    },
    {
      key: 'cookiesMarketing' as keyof ConsentPreferences,
      title: 'Cookies de Marketing',
      description: 'Usados para exibir anúncios relevantes e medir campanhas.',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      required: false,
      legalBasis: 'Consentimento',
      dataCategories: ['Preferências', 'Dados comportamentais'],
      thirdParties: ['Google Ads', 'Facebook Pixel'],
      retentionPeriod: '1 ano',
    },
    {
      key: 'profiling' as keyof ConsentPreferences,
      title: 'Criação de Perfis',
      description:
        'Criação de perfis de usuário para personalização de conteúdo.',
      icon: Brain,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      required: false,
      legalBasis: 'Consentimento',
      dataCategories: [
        'Dados comportamentais',
        'Preferências',
        'Padrões de uso',
      ],
      thirdParties: [],
      retentionPeriod: '3 anos',
    },
    {
      key: 'automatedDecisionMaking' as keyof ConsentPreferences,
      title: 'Decisões Automatizadas',
      description: 'Tomada de decisões automatizadas baseadas em seus dados.',
      icon: Bot,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      required: false,
      legalBasis: 'Consentimento',
      dataCategories: ['Dados comportamentais', 'Dados de uso', 'Preferências'],
      thirdParties: [],
      retentionPeriod: '3 anos',
    },
  ];

  return (
    <>
      {/* Floating button removed - consent manager accessible through other means */}

      {/* Show modal when isOpen is true */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Gerenciamento de Consentimento LGPD
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Gerencie suas preferências de consentimento de acordo com a Lei
                Geral de Proteção de Dados (LGPD).
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Consent Types */}
              <div className="space-y-4">
                {consentTypes.map((type) => {
                  const Icon = type.icon;
                  const isGranted = preferences[type.key];

                  return (
                    <div
                      key={type.key}
                      className={`p-4 rounded-lg border ${type.bgColor}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className={`h-5 w-5 ${type.color}`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {type.title}
                                {type.required && (
                                  <Badge
                                    variant="secondary"
                                    className="ml-2 text-xs"
                                  >
                                    Obrigatório
                                  </Badge>
                                )}
                              </h4>
                              {isGranted && (
                                <Badge variant="default" className="text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Ativo
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {type.description}
                            </p>

                            {/* Details Toggle */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleDetails(type.key)}
                              className="mt-2 p-0 h-auto text-xs"
                            >
                              {showDetails[type.key] ? (
                                <>
                                  <EyeOff className="h-3 w-3 mr-1" />
                                  Ocultar detalhes
                                </>
                              ) : (
                                <>
                                  <Eye className="h-3 w-3 mr-1" />
                                  Ver detalhes
                                </>
                              )}
                            </Button>

                            {/* Detailed Information */}
                            {showDetails[type.key] && (
                              <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                  <div>
                                    <strong>Base Legal:</strong>{' '}
                                    {type.legalBasis}
                                  </div>
                                  <div>
                                    <strong>Período de Retenção:</strong>{' '}
                                    {type.retentionPeriod}
                                  </div>
                                  <div>
                                    <strong>Categorias de Dados:</strong>
                                    <ul className="list-disc list-inside mt-1">
                                      {type.dataCategories.map(
                                        (category, idx) => (
                                          <li key={idx}>{category}</li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                  <div>
                                    <strong>Terceiros:</strong>
                                    {type.thirdParties.length > 0 ? (
                                      <ul className="list-disc list-inside mt-1">
                                        {type.thirdParties.map((party, idx) => (
                                          <li key={idx}>{party}</li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <span className="text-gray-500">
                                        Nenhum
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Withdraw Button for granted consents */}
                                {isGranted && !type.required && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                      handleWithdrawConsent(
                                        type.key.toUpperCase()
                                      )
                                    }
                                    disabled={isLoading}
                                    className="mt-3"
                                  >
                                    Retirar Consentimento
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <Switch
                          checked={preferences[type.key]}
                          onCheckedChange={(checked) =>
                            handlePreferenceChange(type.key, checked)
                          }
                          disabled={type.required || isLoading}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Information Alert */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Informações Importantes:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>
                      • Consentimentos obrigatórios são necessários para o
                      funcionamento do serviço
                    </li>
                    <li>
                      • Você pode alterar suas preferências a qualquer momento
                    </li>
                    <li>
                      • Retirar consentimentos pode afetar a funcionalidade do
                      site
                    </li>
                    <li>
                      • Todas as alterações são registradas para fins de
                      auditoria
                    </li>
                    <li>• Seus dados são protegidos de acordo com a LGPD</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Fechar
                </Button>
                <Button
                  onClick={() => {
                    onConsentChange?.(preferences);
                    onClose?.();
                  }}
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? 'Salvando...' : 'Salvar Preferências'}
                </Button>
              </div>

              {/* Links */}
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                <p>
                  Para mais informações, consulte nossa{' '}
                  <a
                    href="/privacidade"
                    className="text-blue-600 hover:underline"
                  >
                    Política de Privacidade
                  </a>{' '}
                  e{' '}
                  <a href="/lgpd" className="text-blue-600 hover:underline">
                    Direitos LGPD
                  </a>
                  .
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

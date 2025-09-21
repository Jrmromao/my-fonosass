'use client';

import DataSubjectRightsDashboard from '@/components/data-subject-rights/DataSubjectRightsDashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useCSRF } from '@/hooks/useCSRF';
import {
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Edit3,
  Lock,
  Save,
  Shield,
  Smartphone,
  X,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface UserProfileData {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    createdAt: string;
  };
  subscription: {
    tier: 'FREE' | 'PRO';
    status: 'ACTIVE' | 'INACTIVE' | 'PAST_DUE';
    currentPeriodEnd?: string;
  };
  downloadLimits: {
    canDownload: boolean;
    remaining: number;
    isPro: boolean;
  };
  stats: {
    totalDownloads: number;
    uniqueActivities: number;
    recentDownloads: number;
  };
  recentDownloads: Array<{
    id: string;
    fileName: string;
    downloadedAt: string;
    activity: {
      id: string;
      name: string;
      type: string;
      phoneme: string;
      difficulty: string;
    };
  }>;
}

export function UserProfile() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [data, setData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') || 'profile'
  );
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(false);
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaQrCode, setMfaQrCode] = useState('');
  const [mfaVerificationCode, setMfaVerificationCode] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
  });
  const [formErrors, setFormErrors] = useState({
    fullName: '',
    email: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { fetchCSRFToken } = useCSRF();

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/user/profile');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setMfaEnabled(result.data.mfaEnabled || false);
        setEditForm({
          fullName: result.data.user.fullName,
          email: result.data.user.email,
        });
      } else {
        console.error('Profile fetch failed:', result);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar o perfil',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o perfil',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const validateForm = () => {
    const errors = {
      fullName: '',
      email: '',
    };

    // Validate full name
    if (!editForm.fullName.trim()) {
      errors.fullName = 'Nome é obrigatório';
    } else if (editForm.fullName.trim().length < 2) {
      errors.fullName = 'Nome deve ter pelo menos 2 caracteres';
    } else if (editForm.fullName.trim().length > 100) {
      errors.fullName = 'Nome deve ter no máximo 100 caracteres';
    }

    // Validate email
    if (!editForm.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      errors.email = 'Email deve ter um formato válido';
    }

    setFormErrors(errors);
    return !errors.fullName && !errors.email;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormErrors({ fullName: '', email: '' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      fullName: data?.user.fullName || '',
      email: data?.user.email || '',
    });
    setFormErrors({ fullName: '', email: '' });
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      return;
    }

    setIsUpdating(true);
    try {
      const csrfToken = await fetchCSRFToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify(editForm),
      });

      const result = await response.json();

      if (result.success) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                user: {
                  ...prev.user,
                  fullName: editForm.fullName,
                  email: editForm.email,
                },
              }
            : null
        );
        setIsEditing(false);
        toast({
          title: 'Sucesso',
          description: 'Perfil atualizado com sucesso',
        });
      } else {
        throw new Error(result.message || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o perfil',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const setupMFA = async () => {
    setMfaLoading(true);
    try {
      const response = await fetch('/api/user/mfa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();

      if (result.success) {
        setMfaSecret(result.data.secret);
        setMfaQrCode(result.data.qrCode);
        setShowMfaSetup(true);
      }
    } catch (error) {
      console.error('Error setting up MFA:', error);
    } finally {
      setMfaLoading(false);
    }
  };

  const verifyMFA = async () => {
    if (!mfaVerificationCode) return;

    setMfaLoading(true);
    try {
      const response = await fetch('/api/user/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: mfaVerificationCode,
          secret: mfaSecret,
        }),
      });
      const result = await response.json();

      if (result.success) {
        setMfaEnabled(true);
        setShowMfaSetup(false);
        setMfaVerificationCode('');
        setMfaSecret('');
        setMfaQrCode('');
        // Refresh profile data
        fetchProfile();
      }
    } catch (error) {
      console.error('Error verifying MFA:', error);
    } finally {
      setMfaLoading(false);
    }
  };

  const disableMFA = async () => {
    setMfaLoading(true);
    try {
      const response = await fetch('/api/user/mfa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();

      if (result.success) {
        setMfaEnabled(false);
        fetchProfile();
      }
    } catch (error) {
      console.error('Error disabling MFA:', error);
    } finally {
      setMfaLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Erro ao carregar perfil
          </h2>
          <p className="text-gray-600 mb-4">
            Não foi possível carregar os dados do usuário.
          </p>
          <Button onClick={fetchProfile} variant="outline">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!data.user) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Dados do usuário não encontrados
          </h2>
          <p className="text-gray-600 mb-4">
            Os dados do usuário não estão disponíveis.
          </p>
          <Button onClick={fetchProfile} variant="outline">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
          <p className="text-gray-600">
            Gerencie sua conta e acompanhe seu histórico de downloads
          </p>
        </div>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger
            value="profile"
            className="flex items-center gap-2 px-4 py-2 text-sm"
          >
            <Edit3 className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger
            value="data"
            className="flex items-center gap-2 px-4 py-2 text-sm"
          >
            <Shield className="h-4 w-4" />
            Dados LGPD
          </TabsTrigger>
          <TabsTrigger
            value="subscription"
            className="flex items-center gap-2 px-4 py-2 text-sm"
          >
            <CreditCard className="h-4 w-4" />
            Assinatura
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="flex items-center gap-2 px-4 py-2 text-sm"
          >
            <Lock className="h-4 w-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Informações do Perfil</CardTitle>
                {!isEditing && (
                  <Button onClick={handleEdit} variant="outline" size="sm">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {data.user?.fullName
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase() || 'U'}
                </div>

                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nome Completo</Label>
                        <Input
                          id="fullName"
                          value={editForm.fullName}
                          onChange={(e) => {
                            setEditForm((prev) => ({
                              ...prev,
                              fullName: e.target.value,
                            }));
                            if (formErrors.fullName) {
                              setFormErrors((prev) => ({
                                ...prev,
                                fullName: '',
                              }));
                            }
                          }}
                          placeholder="Digite seu nome completo"
                          className={
                            formErrors.fullName ? 'border-red-500' : ''
                          }
                        />
                        {formErrors.fullName && (
                          <p className="text-sm text-red-500">
                            {formErrors.fullName}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editForm.email}
                          onChange={(e) => {
                            setEditForm((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }));
                            if (formErrors.email) {
                              setFormErrors((prev) => ({ ...prev, email: '' }));
                            }
                          }}
                          placeholder="Digite seu email"
                          className={formErrors.email ? 'border-red-500' : ''}
                        />
                        {formErrors.email && (
                          <p className="text-sm text-red-500">
                            {formErrors.email}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveProfile}
                          disabled={isUpdating}
                          size="sm"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {isUpdating ? 'Salvando...' : 'Salvar'}
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          variant="outline"
                          size="sm"
                          disabled={isUpdating}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl font-bold">
                        {data.user?.fullName || 'Usuário'}
                      </h1>
                      <p className="text-gray-600">
                        {data.user?.email || 'N/A'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${data.subscription.tier === 'PRO' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}
                        >
                          {data.subscription.tier}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${data.subscription.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {data.subscription.status === 'ACTIVE'
                            ? 'Ativo'
                            : 'Inativo'}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {!isEditing && data.subscription.tier === 'FREE' && (
                  <Button
                    onClick={async () => {
                      try {
                        const response = await fetch(
                          '/api/stripe/create-checkout',
                          {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                          }
                        );

                        const result = await response.json();

                        if (result.url) {
                          window.location.href = result.url;
                        }
                      } catch (error) {
                        console.error('Error creating checkout:', error);
                      }
                    }}
                  >
                    Upgrade Pro
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Downloads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.stats.totalDownloads}
                </div>
                <p className="text-xs text-gray-600">
                  {data.stats.recentDownloads} nos últimos 7 dias
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Exercícios Únicos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.stats.uniqueActivities}
                </div>
                <p className="text-xs text-gray-600">
                  Exercícios diferentes baixados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Downloads Restantes</CardTitle>
              </CardHeader>
              <CardContent>
                {data.downloadLimits.isPro ? (
                  <div>
                    <div className="text-2xl font-bold text-green-600">∞</div>
                    <p className="text-xs text-gray-600">Ilimitado</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl font-bold">
                      {data.downloadLimits.remaining}
                      <span className="text-sm text-gray-500 font-normal">
                        /5
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">Este mês</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Downloads */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Downloads</CardTitle>
            </CardHeader>
            <CardContent>
              {data.recentDownloads.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhum download realizado ainda
                </p>
              ) : (
                <div className="space-y-3">
                  {data.recentDownloads.map((download) => (
                    <div
                      key={download.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {download.activity.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {download.fileName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(download.downloadedAt).toLocaleDateString(
                            'pt-BR'
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <DataSubjectRightsDashboard />
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assinatura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Plano Atual</p>
                    <p className="text-sm text-gray-500">
                      {data.subscription.tier}
                    </p>
                  </div>
                  <Badge
                    variant={
                      data.subscription.tier === 'PRO' ? 'default' : 'secondary'
                    }
                  >
                    {data.subscription.status === 'ACTIVE'
                      ? 'Ativo'
                      : 'Inativo'}
                  </Badge>
                </div>
                {data.subscription.tier === 'FREE' && (
                  <Button
                    onClick={async () => {
                      try {
                        const response = await fetch(
                          '/api/stripe/create-checkout',
                          {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                          }
                        );

                        const result = await response.json();

                        if (result.url) {
                          window.location.href = result.url;
                        }
                      } catch (error) {
                        console.error('Error creating checkout:', error);
                      }
                    }}
                  >
                    Upgrade Pro
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {/* MFA Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Autenticação de Dois Fatores (2FA)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!mfaEnabled ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800">
                        2FA não ativado
                      </p>
                      <p className="text-sm text-yellow-700">
                        Proteja sua conta com autenticação de dois fatores
                      </p>
                    </div>
                  </div>

                  {!showMfaSetup ? (
                    <Button
                      onClick={setupMFA}
                      disabled={mfaLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Smartphone className="h-4 w-4 mr-2" />
                      {mfaLoading ? 'Configurando...' : 'Ativar 2FA'}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">
                          Configure seu aplicativo autenticador
                        </h4>
                        <p className="text-sm text-blue-700 mb-4">
                          Escaneie o QR code com seu aplicativo autenticador
                          (Google Authenticator, Authy, etc.)
                        </p>

                        {mfaQrCode && (
                          <div className="flex justify-center mb-4">
                            <img
                              src={mfaQrCode}
                              alt="QR Code"
                              className="w-48 h-48 border rounded"
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">
                            Ou digite manualmente:
                          </p>
                          <code className="block p-2 bg-gray-100 rounded text-sm font-mono break-all">
                            {mfaSecret}
                          </code>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Código de verificação
                        </label>
                        <input
                          type="text"
                          value={mfaVerificationCode}
                          onChange={(e) =>
                            setMfaVerificationCode(e.target.value)
                          }
                          placeholder="Digite o código de 6 dígitos"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          maxLength={6}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={verifyMFA}
                          disabled={
                            mfaLoading || mfaVerificationCode.length !== 6
                          }
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {mfaLoading ? 'Verificando...' : 'Verificar e Ativar'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowMfaSetup(false);
                            setMfaSecret('');
                            setMfaQrCode('');
                            setMfaVerificationCode('');
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">2FA ativado</p>
                      <p className="text-sm text-green-700">
                        Sua conta está protegida com autenticação de dois
                        fatores
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={disableMFA}
                    disabled={mfaLoading}
                    variant="destructive"
                    className="w-full sm:w-auto"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {mfaLoading ? 'Desativando...' : 'Desativar 2FA'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Dicas de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p>Use senhas únicas e complexas para sua conta</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p>Nunca compartilhe seus códigos de autenticação</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p>Faça logout em dispositivos públicos</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p>Mantenha seu aplicativo autenticador atualizado</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

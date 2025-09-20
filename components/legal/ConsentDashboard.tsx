'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { ConsentService } from '@/lib/services/consentService';
import { DataRetentionService } from '@/lib/services/dataRetentionService';
import { useUser } from '@clerk/nextjs';
import {
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock,
    Database,
    Download,
    Eye,
    RefreshCw,
    Shield,
    Trash2,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface ConsentDashboardProps {
  className?: string;
}

export default function ConsentDashboard({ className }: ConsentDashboardProps) {
  const { user } = useUser();
  const [consentRecords, setConsentRecords] = useState<any[]>([]);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);
  const [retentionStats, setRetentionStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const [consentData, auditData, statsData] = await Promise.all([
        ConsentService.getUserConsentStatus(user.id),
        ConsentService.getConsentAuditTrail(user.id),
        DataRetentionService.getRetentionStatistics()
      ]);
      
      setConsentRecords(consentData);
      setAuditTrail(auditData);
      setRetentionStats(statsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do painel.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawConsent = async (consentType: string) => {
    if (!user?.id) return;
    
    try {
      await ConsentService.withdrawConsent(
        user.id,
        consentType as any,
        'Usuário retirou consentimento via painel',
        undefined,
        navigator.userAgent
      );
      
      await loadDashboardData();
      
      toast({
        title: "Consentimento retirado",
        description: "O consentimento foi retirado com sucesso.",
      });
    } catch (error) {
      console.error('Error withdrawing consent:', error);
      toast({
        title: "Erro",
        description: "Não foi possível retirar o consentimento.",
        variant: "destructive"
      });
    }
  };

  const getConsentStatus = (record: any) => {
    if (!record.granted) return { status: 'withdrawn', color: 'destructive', icon: XCircle };
    if (record.expiresAt && new Date(record.expiresAt) < new Date()) {
      return { status: 'expired', color: 'destructive', icon: AlertTriangle };
    }
    if (record.expiresAt && new Date(record.expiresAt) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
      return { status: 'expiring', color: 'warning', icon: Clock };
    }
    return { status: 'active', color: 'default', icon: CheckCircle };
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConsentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'DATA_PROCESSING': 'Processamento de Dados',
      'MARKETING_COMMUNICATIONS': 'Comunicações de Marketing',
      'ANALYTICS_TRACKING': 'Rastreamento Analítico',
      'THIRD_PARTY_SHARING': 'Compartilhamento com Terceiros',
      'COOKIES_ESSENTIAL': 'Cookies Essenciais',
      'COOKIES_ANALYTICS': 'Cookies Analíticos',
      'COOKIES_FUNCTIONAL': 'Cookies Funcionais',
      'COOKIES_MARKETING': 'Cookies de Marketing',
      'PROFILING': 'Criação de Perfis',
      'AUTOMATED_DECISION_MAKING': 'Decisões Automatizadas'
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Painel de Consentimento LGPD</h2>
        <Button onClick={loadDashboardData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="consents">Consentimentos</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
          <TabsTrigger value="retention">Retenção</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Consentimentos Ativos</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {consentRecords.filter(r => r.granted && (!r.expiresAt || new Date(r.expiresAt) > new Date())).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  de {consentRecords.length} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expirando em 30 dias</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {consentRecords.filter(r => 
                    r.granted && 
                    r.expiresAt && 
                    new Date(r.expiresAt) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) &&
                    new Date(r.expiresAt) > new Date()
                  ).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  precisam de renovação
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eventos de Auditoria</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{auditTrail.length}</div>
                <p className="text-xs text-muted-foreground">
                  registros de auditoria
                </p>
              </CardContent>
            </Card>
          </div>

          {retentionStats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Estatísticas de Retenção de Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{retentionStats.totalPolicies}</div>
                    <p className="text-sm text-muted-foreground">Políticas</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{retentionStats.activePolicies}</div>
                    <p className="text-sm text-muted-foreground">Ativas</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{retentionStats.totalLogs}</div>
                    <p className="text-sm text-muted-foreground">Logs Totais</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{retentionStats.recentLogs}</div>
                    <p className="text-sm text-muted-foreground">Últimas 24h</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="consents" className="space-y-4">
          <div className="space-y-4">
            {consentRecords.map((record) => {
              const status = getConsentStatus(record);
              const StatusIcon = status.icon;
              
              return (
                <Card key={record.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <StatusIcon className={`h-5 w-5 ${
                          status.color === 'destructive' ? 'text-red-500' :
                          status.color === 'warning' ? 'text-yellow-500' :
                          'text-green-500'
                        }`} />
                        <div>
                          <h3 className="font-semibold">
                            {getConsentTypeLabel(record.consentType)}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {record.purpose}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={status.color as any}>
                          {status.status === 'active' ? 'Ativo' :
                           status.status === 'expiring' ? 'Expirando' :
                           status.status === 'expired' ? 'Expirado' :
                           'Retirado'}
                        </Badge>
                        {record.granted && !record.expiresAt && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleWithdrawConsent(record.consentType)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Retirar
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <strong>Base Legal:</strong> {record.legalBasis}
                      </div>
                      <div>
                        <strong>Concedido em:</strong> {record.grantedAt ? formatDate(record.grantedAt) : 'N/A'}
                      </div>
                      <div>
                        <strong>Expira em:</strong> {record.expiresAt ? formatDate(record.expiresAt) : 'Não expira'}
                      </div>
                    </div>
                    
                    {record.dataCategories && record.dataCategories.length > 0 && (
                      <div className="mt-2">
                        <strong className="text-sm">Categorias de Dados:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {record.dataCategories.map((category: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <div className="space-y-4">
            {auditTrail.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Nenhum evento de auditoria encontrado.
                </AlertDescription>
              </Alert>
            ) : (
              auditTrail.map((log) => (
                <Card key={log.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Activity className="h-5 w-5 text-blue-500" />
                        <div>
                          <h3 className="font-semibold">
                            {getConsentTypeLabel(log.consentRecord.consentType)}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {log.reason || 'Ação realizada'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {log.action}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(log.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="retention" className="space-y-4">
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              <strong>Política de Retenção de Dados:</strong> Seus dados são mantidos apenas pelo tempo necessário 
              para cumprir os propósitos para os quais foram coletados, conforme estabelecido pela LGPD.
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardHeader>
              <CardTitle>Seus Direitos LGPD</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-semibold">Acesso aos Dados</h4>
                    <p className="text-sm text-muted-foreground">
                      Visualize todos os seus dados pessoais
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-green-500" />
                  <div>
                    <h4 className="font-semibold">Portabilidade</h4>
                    <p className="text-sm text-muted-foreground">
                      Exporte seus dados em formato legível
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Trash2 className="h-5 w-5 text-red-500" />
                  <div>
                    <h4 className="font-semibold">Exclusão</h4>
                    <p className="text-sm text-muted-foreground">
                      Solicite a exclusão dos seus dados
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 text-purple-500" />
                  <div>
                    <h4 className="font-semibold">Retificação</h4>
                    <p className="text-sm text-muted-foreground">
                      Corrija dados incorretos ou incompletos
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Acessar Meus Dados
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

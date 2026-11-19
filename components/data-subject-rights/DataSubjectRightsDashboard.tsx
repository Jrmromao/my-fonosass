'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCSRF } from '@/hooks/useCSRF';
import { useToast } from '@/hooks/use-toast';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Edit3,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ExportRequest {
  id: string;
  format: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  requestedAt: string;
  completedAt: string | null;
  expiresAt: string;
  downloadUrl: string | null;
  downloadCount: number;
}

interface CorrectionRequest {
  id: string;
  description: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  requestedAt: string;
  resolvedAt: string | null;
  resolutionNote: string | null;
}

export default function DataSubjectRightsDashboard() {
  const { t } = useTranslation();
  const [exportRequests, setExportRequests] = useState<ExportRequest[]>([]);
  const [correctionRequests, setCorrectionRequests] = useState<
    CorrectionRequest[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
  const [description, setDescription] = useState('');
  const { toast } = useToast();
  const { fetchCSRFToken } = useCSRF();

  // Load user's data requests
  useEffect(() => {
    loadExportRequests();
    loadCorrectionRequests();
  }, []);

  const loadExportRequests = async () => {
    try {
      const response = await fetch('/api/user-data/export-requests');
      const data = await response.json();
      if (data.success) {
        setExportRequests(data.data.exportRequests);
      }
    } catch (error) {
      console.error('Error loading export requests:', error);
    }
  };

  const loadCorrectionRequests = async () => {
    try {
      const response = await fetch('/api/user-data/update');
      const data = await response.json();
      if (data.success) {
        setCorrectionRequests(data.data.correctionRequests || []);
      }
    } catch (error) {
      console.error('Error loading correction requests:', error);
    }
  };

  const handleDataExport = async (format: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user-data/export-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          reason: 'Usuário solicitou exportação de dados',
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: t('dataRights.messages.exportSubmitted'),
          description: t('dataRights.messages.exportSubmittedDesc'),
        });
        loadExportRequests();
      } else {
        throw new Error(
          data.error || data.message || 'Failed to submit export request'
        );
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description:
          'Falha ao enviar solicitação de exportação. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataCorrection = async () => {
    if (description.trim().length < 10) {
      toast({
        title: 'Erro de Validação',
        description: 'Descreva a correção com pelo menos 10 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const csrfToken = await fetchCSRFToken();
      const response = await fetch('/api/user-data/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        },
        body: JSON.stringify({ description }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to submit correction request');
      }
      toast({
        title: 'Solicitação enviada',
        description:
          'Nosso encarregado de dados responderá por email em até 15 dias úteis.',
      });
      setShowCorrectionForm(false);
      setDescription('');
      loadCorrectionRequests();
    } catch (error) {
      toast({
        title: 'Erro',
        description:
          error instanceof Error && error.message
            ? error.message
            : 'Falha ao enviar solicitação de correção. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'FAILED':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-neutral-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      COMPLETED: 'default',
      RESOLVED: 'default',
      PENDING: 'secondary',
      FAILED: 'destructive',
      REJECTED: 'destructive',
      EXPIRED: 'outline',
    } as const;
    const labels: Record<string, string> = {
      COMPLETED: 'Concluída',
      RESOLVED: 'Atendida',
      PENDING: 'Pendente',
      FAILED: 'Falhou',
      REJECTED: 'Recusada',
      EXPIRED: 'Expirada',
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status] ?? status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Data Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-neutral-600" />
            Exportar Meus Dados
          </CardTitle>
          <CardDescription>
            Baixe uma cópia dos seus dados pessoais
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* JSON is the only export we generate (portable, LGPD art. 18 V). */}
          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={() => handleDataExport('json')}
              disabled={isLoading}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              JSON
            </Button>
          </div>

          {exportRequests.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-neutral-700">
                Solicitações Recentes
              </h4>
              <div className="space-y-2">
                {exportRequests.slice(0, 2).map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <span className="text-sm">
                        {request.format.toUpperCase()}
                      </span>
                      <span className="text-xs text-neutral-600">
                        {new Date(request.requestedAt).toLocaleDateString(
                          'pt-BR'
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(request.status)}
                      {request.downloadUrl && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={request.downloadUrl} download>
                            <Download className="h-3 w-3 mr-1" />
                            Baixar
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Rectification Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-green-600" />
            Corrigir Dados
          </CardTitle>
          <CardDescription>
            Solicite correções aos seus dados pessoais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700">
            Para corrigir o <strong>nome</strong>, use{' '}
            <Link href="/dashboard/profile" className="underline">
              Meu perfil
            </Link>
            . Para o <strong>email</strong>, use "Gerenciar conta" no mesmo
            lugar: o novo endereço é verificado por segurança. Os demais pedidos
            vão para o nosso encarregado de dados (DPO).
          </p>

          {!showCorrectionForm ? (
            <div className="text-center py-4">
              <p className="text-sm text-neutral-600 mb-4">
                Precisa corrigir outra informação?
              </p>
              <Button
                onClick={() => setShowCorrectionForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Solicitar Correção
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  O que precisa ser corrigido? *
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Diga qual informação está incorreta e qual é o valor correto"
                  className="min-h-[100px]"
                  maxLength={1000}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleDataCorrection}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLoading ? 'Enviando...' : 'Enviar'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCorrectionForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {correctionRequests.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-neutral-700">
                Solicitações Recentes
              </h4>
              <div className="space-y-2">
                {correctionRequests.slice(0, 3).map((request) => (
                  <div
                    key={request.id}
                    className="space-y-1 p-3 bg-neutral-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <Edit3 className="h-4 w-4 shrink-0 text-green-600" />
                        <span className="truncate text-sm">
                          {request.description}
                        </span>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                    <span className="text-xs text-neutral-600">
                      {new Date(request.requestedAt).toLocaleDateString(
                        'pt-BR'
                      )}
                    </span>
                    {request.resolutionNote && (
                      <p className="text-sm text-neutral-700">
                        Resposta: {request.resolutionNote}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

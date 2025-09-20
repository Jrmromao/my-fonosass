'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { AlertTriangle, CheckCircle, Clock, Download, Edit3, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface ExportRequest {
  id: string
  format: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'EXPIRED'
  requestedAt: string
  expiresAt: string
  downloadUrl?: string
  downloadCount: number
  maxDownloads: number
}

interface CorrectionRequest {
  id: string
  field: string
  currentValue?: string
  requestedValue: string
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  requestedAt: string
}

export default function DataSubjectRightsDashboard() {
  const { t } = useTranslation()
  const [exportRequests, setExportRequests] = useState<ExportRequest[]>([])
  const [correctionRequests, setCorrectionRequests] = useState<CorrectionRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showCorrectionForm, setShowCorrectionForm] = useState(false)
  const [correctionData, setCorrectionData] = useState({
    field: '',
    currentValue: '',
    requestedValue: '',
    reason: ''
  })
  const { toast } = useToast()

  // Load user's data requests
  useEffect(() => {
    loadExportRequests()
    loadCorrectionRequests()
  }, [])

  const loadExportRequests = async () => {
    try {
      const response = await fetch('/api/user-data/export-requests')
      const data = await response.json()
      if (data.success) {
        setExportRequests(data.data.exportRequests)
      }
    } catch (error) {
      console.error('Error loading export requests:', error)
    }
  }

  const loadCorrectionRequests = async () => {
    try {
      const response = await fetch('/api/user-data/update')
      const data = await response.json()
      if (data.success) {
        setCorrectionRequests(data.data.correctionRequests || [])
      }
    } catch (error) {
      console.error('Error loading correction requests:', error)
    }
  }

  const handleDataExport = async (format: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/user-data/export-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, reason: 'Usuário solicitou exportação de dados' })
      })
      
      const data = await response.json()
      if (data.success) {
        toast({
          title: t('dataRights.messages.exportSubmitted'),
          description: t('dataRights.messages.exportSubmittedDesc'),
        })
        loadExportRequests()
      } else {
        throw new Error(data.message || 'Failed to submit export request')
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao enviar solicitação de exportação. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDataDeletion = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/user-data/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          confirmDeletion: true, 
          reason: 'Usuário solicitou exclusão completa de dados' 
        })
      })
      
      const data = await response.json()
      if (data.success) {
        toast({
          title: 'Exclusão de Dados Iniciada',
          description: 'Sua conta e todos os dados associados serão permanentemente excluídos.',
        })
        // Redirect to home page after deletion
        setTimeout(() => {
          window.location.href = '/'
        }, 3000)
      } else {
        throw new Error(data.message || 'Failed to delete data')
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao excluir dados. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDataCorrection = async () => {
    if (!correctionData.field || !correctionData.requestedValue || !correctionData.reason) {
      toast({
        title: 'Erro de Validação',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/user-data/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(correctionData)
      })
      
      const data = await response.json()
      if (data.success) {
        toast({
          title: 'Solicitação de Correção Enviada',
          description: 'Sua solicitação de correção de dados foi enviada para análise.',
        })
        setShowCorrectionForm(false)
        setCorrectionData({ field: '', currentValue: '', requestedValue: '', reason: '' })
        loadCorrectionRequests()
      } else {
        throw new Error(data.message || 'Failed to submit correction request')
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao enviar solicitação de correção. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'FAILED':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      'COMPLETED': 'default',
      'PENDING': 'secondary',
      'FAILED': 'destructive',
      'EXPIRED': 'outline'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{t('dataRights.title')}</h1>
        <p className="text-muted-foreground">
          {t('dataRights.description')}
        </p>
      </div>

      {/* Data Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportação de Dados
          </CardTitle>
          <CardDescription>
            Baixe uma cópia de todos os seus dados pessoais armazenados em nosso sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => handleDataExport('json')}
              disabled={isLoading}
              className="w-full"
            >
              Exportar como JSON
            </Button>
            <Button 
              onClick={() => handleDataExport('csv')}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              Exportar como CSV
            </Button>
            <Button 
              onClick={() => handleDataExport('pdf')}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              Exportar como PDF
            </Button>
          </div>

          {exportRequests.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Solicitações de Exportação Recentes</h4>
              <div className="space-y-2">
                {exportRequests.slice(0, 3).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(request.status)}
                      <div>
                        <p className="font-medium">Exportação {request.format.toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">
                          Solicitado em {new Date(request.requestedAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(request.status)}
                      {request.downloadUrl && (
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Baixar
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
            <Edit3 className="h-5 w-5" />
            Retificação de Dados
          </CardTitle>
          <CardDescription>
            Solicite correções aos seus dados pessoais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showCorrectionForm ? (
            <Button onClick={() => setShowCorrectionForm(true)}>
              Solicitar Correção de Dados
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="field">Campo para Corrigir</Label>
                  <Select value={correctionData.field} onValueChange={(value) => setCorrectionData({...correctionData, field: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o campo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fullName">Nome Completo</SelectItem>
                      <SelectItem value="email">Endereço de Email</SelectItem>
                      <SelectItem value="phone">Número de Telefone</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currentValue">Valor Atual (se conhecido)</Label>
                  <Input
                    id="currentValue"
                    value={correctionData.currentValue}
                    onChange={(e) => setCorrectionData({...correctionData, currentValue: e.target.value})}
                    placeholder="Digite o valor atual"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="requestedValue">Valor Corrigido *</Label>
                <Input
                  id="requestedValue"
                  value={correctionData.requestedValue}
                  onChange={(e) => setCorrectionData({...correctionData, requestedValue: e.target.value})}
                  placeholder="Digite o valor corrigido"
                  required
                />
              </div>
              <div>
                <Label htmlFor="reason">Motivo da Correção *</Label>
                <Textarea
                  id="reason"
                  value={correctionData.reason}
                  onChange={(e) => setCorrectionData({...correctionData, reason: e.target.value})}
                  placeholder="Por favor, explique por que esta correção é necessária"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleDataCorrection} disabled={isLoading}>
                  Enviar Solicitação
                </Button>
                <Button variant="outline" onClick={() => setShowCorrectionForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {correctionRequests.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Solicitações de Correção Recentes</h4>
              <div className="space-y-2">
                {correctionRequests.slice(0, 3).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{request.field}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.requestedValue} • {new Date(request.requestedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Deletion Section */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Exclusão de Dados
          </CardTitle>
          <CardDescription>
            Exclua permanentemente todos os seus dados pessoais do nosso sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Atenção:</strong> Esta ação não pode ser desfeita. Todos os seus dados, incluindo sua conta, 
              serão permanentemente excluídos e não poderão ser recuperados.
            </AlertDescription>
          </Alert>

          {!showDeleteConfirm ? (
            <Button 
              onClick={() => setShowDeleteConfirm(true)}
              variant="destructive"
            >
              Solicitar Exclusão de Dados
            </Button>
          ) : (
            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Tem certeza absoluta de que deseja excluir todos os seus dados? Esta ação é irreversível.
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button 
                  onClick={handleDataDeletion} 
                  disabled={isLoading}
                  variant="destructive"
                >
                  Sim, Excluir Todos os Meus Dados
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

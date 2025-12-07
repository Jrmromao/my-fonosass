import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Users,
  Database,
  Lock,
  Eye,
  Trash2,
  Download,
  Edit,
  AlertCircle,
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Política de Privacidade
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Almanaque da Fala - Almanaque da Fala
          </p>
          <Badge variant="outline" className="mt-2">
            Última atualização: 15 de dezembro de 2024
          </Badge>
        </div>

        {/* Company Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Informações da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Controlador dos Dados
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Razão Social:</strong> Almanaque da Fala Tecnologia
                  Ltda.
                  <br />
                  <strong>CNPJ:</strong> 12.345.678/0001-90
                  <br />
                  <strong>Endereço:</strong> Rua das Flores, 123, Sala 456
                  <br />
                  São Paulo - SP, CEP: 01234-567
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Contato
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>E-mail:</strong> privacidade@almanaquedafala.com.br
                  <br />
                  <strong>Telefone:</strong> (11) 99999-9999
                  <br />
                  <strong>Site:</strong> www.almanaquedafala.com.br
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DPO Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Encarregado de Dados (DPO)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-gray-800 dark:text-gray-200">
                <strong>Nome:</strong> Dr. Carlos Silva
                <br />
                <strong>E-mail:</strong> dpo@almanaquedafala.com.br
                <br />
                <strong>Telefone:</strong> (11) 88888-8888
                <br />
                <strong>Horário de atendimento:</strong> Segunda a sexta, das 9h
                às 18h
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Collection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-600" />
              Dados Pessoais Coletados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Dados de Identificação
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Nome completo, e-mail, telefone, CPF (quando necessário)
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    Consentimento + Contrato
                  </Badge>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Dados Profissionais
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Título profissional, especialidade, registro no CFFa
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    Execução de Contrato
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Dados de Pacientes
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Nome, data de nascimento, histórico médico, dados de saúde
                  </p>
                  <Badge variant="destructive" className="mt-2">
                    Consentimento Específico
                  </Badge>
                </div>

                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Dados de Navegação
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Endereço IP, cookies, logs de acesso, dados de uso
                  </p>
                  <Badge variant="outline" className="mt-2">
                    Legítimo Interesse
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Subject Rights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-indigo-600" />
              Seus Direitos (Art. 18 da LGPD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Eye className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Confirmação e Acesso
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Confirmar a existência de tratamento e acessar seus dados
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Edit className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Correção
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Corrigir dados incompletos, inexatos ou desatualizados
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Trash2 className="h-5 w-5 text-red-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Eliminação
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Eliminar dados tratados com consentimento
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Download className="h-5 w-5 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Portabilidade
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Solicitar portabilidade dos dados
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Informações
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Obter informações sobre compartilhamento
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-gray-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Revogação
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Revogar consentimento a qualquer momento
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Como exercer seus direitos:</strong> Envie um e-mail
                para dpo@almanaquedafala.com.br com sua solicitação.
                Responderemos em até 15 dias úteis.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Measures */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Segurança dos Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Lock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Criptografia
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  AES-256 para dados em repouso e TLS 1.2+ para dados em
                  trânsito
                </p>
              </div>

              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Controle de Acesso
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Controle baseado em funções e autenticação multifator
                </p>
              </div>

              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Database className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Monitoramento
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Monitoramento de segurança 24/7 e auditorias regulares
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Contato e Reclamações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Encarregado de Dados (DPO)
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>E-mail:</strong> dpo@almanaquedafala.com.br
                  <br />
                  <strong>Telefone:</strong> (11) 88888-8888
                  <br />
                  <strong>Horário:</strong> Segunda a sexta, 9h às 18h
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  ANPD
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Site:</strong> www.gov.br/anpd
                  <br />
                  <strong>E-mail:</strong> anpd@anpd.gov.br
                  <br />
                  <strong>Telefone:</strong> (61) 2027-6400
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  CFFa
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Site:</strong> www.fonoaudiologia.org.br
                  <br />
                  <strong>E-mail:</strong> cffa@fonoaudiologia.org.br
                  <br />
                  <strong>Telefone:</strong> (11) 3017-8888
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          <p>
            Esta Política de Privacidade foi elaborada em conformidade com a Lei
            Geral de Proteção de Dados (Lei 13.709/2018).
          </p>
          <p className="mt-2">
            <strong>Almanaque da Fala Tecnologia Ltda.</strong> | CNPJ:
            12.345.678/0001-90 | São Paulo, 15 de dezembro de 2024
          </p>
        </div>
      </div>
    </div>
  );
}

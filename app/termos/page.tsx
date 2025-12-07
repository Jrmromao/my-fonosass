import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Shield,
  CreditCard,
  Users,
  AlertTriangle,
  Scale,
  Phone,
  Mail,
} from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Termos de Uso
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
              <FileText className="h-5 w-5 text-blue-600" />
              Informações da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Identificação
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
                  <strong>E-mail:</strong> contato@almanaquedafala.com.br
                  <br />
                  <strong>Telefone:</strong> (11) 99999-9999
                  <br />
                  <strong>Site:</strong> www.almanaquedafala.com.br
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Description */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Objeto dos Termos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Estes Termos de Uso regulam o uso da plataforma Almanaque da Fala,
              incluindo:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Sistema de gestão para fonoaudiólogos
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Prontuários digitais de pacientes
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Ferramentas terapêuticas interativas
                </li>
              </ul>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Sistema de agendamento
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Sistema de cobrança
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Relatórios e análises
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Registration Requirements */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Cadastro e Uso da Plataforma
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Requisitos para Cadastro
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Ser fonoaudiólogo registrado no CFFa
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Fornecer dados verdadeiros e atualizados
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Aceitar estes Termos e a Política de Privacidade
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Maioridade civil (18 anos)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Possuir equipamento compatível
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Conexão com internet
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Responsabilidades do Usuário
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Manter dados atualizados</li>
                  <li>• Usar a plataforma conforme finalidade</li>
                  <li>• Respeitar direitos de terceiros</li>
                </ul>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Não compartilhar credenciais de acesso</li>
                  <li>• Reportar problemas de segurança</li>
                  <li>• Cumprir regulamentações profissionais</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Plans */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-orange-600" />
              Planos e Cobrança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Básico
                </h4>
                <p className="text-2xl font-bold text-blue-600 mb-2">
                  R$ 97/mês
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Até 50 pacientes
                </p>
              </div>
              <div className="border rounded-lg p-4 border-green-500 bg-green-50 dark:bg-green-900/20">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Profissional
                </h4>
                <p className="text-2xl font-bold text-green-600 mb-2">
                  R$ 197/mês
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Pacientes ilimitados
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Clínica
                </h4>
                <p className="text-2xl font-bold text-purple-600 mb-2">
                  R$ 497/mês
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Múltiplos profissionais
                </p>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Política de Cobrança
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Cobrança antecipada mensal</li>
                <li>• Renovação automática</li>
                <li>• Cancelamento com 30 dias de antecedência</li>
                <li>• Formas de pagamento: Cartão, PIX, Boleto</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Data Protection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Proteção de Dados e LGPD
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Conformidade com LGPD
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Tratamento conforme bases legais previstas</li>
                  <li>• Implementação de medidas de segurança</li>
                  <li>• Respeito aos direitos dos titulares</li>
                  <li>• Notificação de incidentes de segurança</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Dados de Pacientes
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Consentimento específico para dados de saúde</li>
                  <li>• Finalidade limitada ao tratamento terapêutico</li>
                  <li>• Medidas especiais de proteção</li>
                  <li>• Retenção conforme Resolução CFFa</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Rights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-indigo-600" />
              Direitos dos Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Direitos de Acesso
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Acesso aos próprios dados</li>
                  <li>• Informações sobre tratamento</li>
                  <li>• Portabilidade de dados</li>
                  <li>• Retificação de dados</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Direitos de Controle
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Revogação de consentimento</li>
                  <li>• Limitação do tratamento</li>
                  <li>• Oposição ao tratamento</li>
                  <li>• Eliminação de dados</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <p className="text-sm text-indigo-800 dark:text-indigo-200">
                <strong>Como exercer seus direitos:</strong> Envie um e-mail
                para dpo@almanaquedafala.com.br com sua solicitação.
                Responderemos em até 15 dias úteis.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dispute Resolution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Resolução de Conflitos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <Scale className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Mediação
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Tentativa de resolução amigável via Câmara de Mediação
                </p>
              </div>

              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Arbitragem
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Arbitragem para valores superiores a R$ 5.000
                </p>
              </div>

              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Scale className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Jurisdição
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Foro da Comarca de São Paulo/SP
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-green-600" />
              Contato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Contato Geral
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>E-mail:</strong> contato@almanaquedafala.com.br
                  <br />
                  <strong>Telefone:</strong> (11) 99999-9999
                  <br />
                  <strong>Endereço:</strong> Rua das Flores, 123, Sala 456
                  <br />
                  São Paulo - SP, CEP: 01234-567
                </p>
              </div>

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
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          <p>
            Estes Termos de Uso foram elaborados em conformidade com a Lei Geral
            de Proteção de Dados (Lei 13.709/2018).
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

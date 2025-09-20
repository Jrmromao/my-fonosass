import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, FileText, AlertCircle, CheckCircle, Clock, Phone, Mail } from 'lucide-react';

export default function LGPDPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Informações LGPD
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Lei Geral de Proteção de Dados - Almanaque da Fala
          </p>
          <Badge variant="outline" className="mt-2">
            Lei 13.709/2018
          </Badge>
        </div>

        {/* What is LGPD */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              O que é a LGPD?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              A Lei Geral de Proteção de Dados (LGPD) é a legislação brasileira que regula o tratamento de dados pessoais. 
              Ela garante maior controle e transparência sobre como suas informações são coletadas, utilizadas e protegidas.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Principais Objetivos</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Proteger a privacidade dos cidadãos</li>
                  <li>• Garantir transparência no tratamento de dados</li>
                  <li>• Estabelecer direitos para os titulares</li>
                  <li>• Criar responsabilidades para as empresas</li>
                </ul>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Aplicação</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Dados pessoais de pessoas físicas</li>
                  <li>• Tratamento realizado no Brasil</li>
                  <li>• Oferecimento de bens/serviços no Brasil</li>
                  <li>• Dados coletados no Brasil</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Seus Direitos como Titular de Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Confirmação e Acesso</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Confirmar se seus dados estão sendo tratados e acessar informações sobre o tratamento.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Correção</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Corrigir dados incompletos, inexatos ou desatualizados.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Eliminação</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Solicitar a eliminação de dados tratados com base no consentimento.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Portabilidade</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Solicitar a portabilidade de seus dados para outro fornecedor.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Informações</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Obter informações sobre entidades com quem compartilhamos seus dados.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Revogação</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Revogar o consentimento a qualquer momento.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Como exercer seus direitos:</strong> Envie um e-mail para dpo@almanaquedafala.com.br 
                com sua solicitação. Responderemos em até 15 dias úteis, conforme previsto na LGPD.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Processing */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Como Tratamos Seus Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Bases Legais para Tratamento</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="border-l-4 border-green-500 pl-4">
                      <h5 className="font-medium text-gray-900 dark:text-white">Consentimento</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Quando você autoriza expressamente o tratamento
                      </p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h5 className="font-medium text-gray-900 dark:text-white">Execução de Contrato</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Para cumprir obrigações contratuais
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h5 className="font-medium text-gray-900 dark:text-white">Legítimo Interesse</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Para melhorar nossos serviços
                      </p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h5 className="font-medium text-gray-900 dark:text-white">Obrigação Legal</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Para cumprir determinações legais
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Finalidades do Tratamento</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h5 className="font-medium text-gray-900 dark:text-white mb-1">Autenticação</h5>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Identificar e autenticar usuários
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h5 className="font-medium text-gray-900 dark:text-white mb-1">Serviços</h5>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Prestar serviços de fonoaudiologia
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h5 className="font-medium text-gray-900 dark:text-white mb-1">Melhorias</h5>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Melhorar e desenvolver produtos
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Measures */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Medidas de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <Shield className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Criptografia</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  AES-256 para dados em repouso e TLS 1.2+ para dados em trânsito
                </p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Controle de Acesso</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Controle baseado em funções e autenticação multifator
                </p>
              </div>
              
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <AlertCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Monitoramento</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Monitoramento 24/7 e auditorias regulares de segurança
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Retenção de Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Mantemos seus dados apenas pelo tempo necessário para cumprir as finalidades para as quais foram coletados:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Dados de Usuário</span>
                    <Badge variant="outline">2 anos</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Dados de Pacientes</span>
                    <Badge variant="outline">20 anos</Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Dados de Pagamento</span>
                    <Badge variant="outline">5 anos</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Logs de Sistema</span>
                    <Badge variant="outline">6 meses</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-green-600" />
              Contato e Reclamações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Encarregado de Dados (DPO)</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>E-mail:</strong> dpo@almanaquedafala.com.br<br />
                  <strong>Telefone:</strong> (11) 88888-8888<br />
                  <strong>Horário:</strong> Segunda a sexta, 9h às 18h
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">ANPD</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Site:</strong> www.gov.br/anpd<br />
                  <strong>E-mail:</strong> anpd@anpd.gov.br<br />
                  <strong>Telefone:</strong> (61) 2027-6400
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">CFFa</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Site:</strong> www.fonoaudiologia.org.br<br />
                  <strong>E-mail:</strong> cffa@fonoaudiologia.org.br<br />
                  <strong>Telefone:</strong> (11) 3017-8888
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          <p>
            Esta página foi elaborada em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018).
          </p>
          <p className="mt-2">
            <strong>Almanaque da Fala Tecnologia Ltda.</strong> | CNPJ: 12.345.678/0001-90 | São Paulo, 15 de dezembro de 2024
          </p>
        </div>
      </div>
    </div>
  );
}

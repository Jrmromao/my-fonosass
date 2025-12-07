import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, Phone, Clock, Shield, FileText, AlertCircle, CheckCircle } from 'lucide-react';

export default function DPOPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Encarregado de Dados (DPO)
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Dr. Carlos Silva - Especialista em Proteção de Dados
          </p>
          <Badge variant="outline" className="mt-2">
            Lei Geral de Proteção de Dados (LGPD)
          </Badge>
        </div>

        {/* DPO Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Informações do DPO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Dados Pessoais</h4>
                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                  <p><strong>Nome:</strong> Dr. Carlos Silva</p>
                  <p><strong>Formação:</strong> Direito - USP</p>
                  <p><strong>Especialização:</strong> Proteção de Dados e Privacidade</p>
                  <p><strong>Certificações:</strong> CIPP/E, CIPP/US, CIPM</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Experiência</h4>
                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                  <p><strong>Anos de experiência:</strong> 8 anos</p>
                  <p><strong>Área de atuação:</strong> Compliance LGPD</p>
                  <p><strong>Setor:</strong> Tecnologia e Saúde</p>
                  <p><strong>Idiomas:</strong> Português, Inglês, Espanhol</p>
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
              Informações de Contato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">E-mail</h4>
                    <p className="text-gray-600 dark:text-gray-300">dpo@almanaquedafala.com.br</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Telefone</h4>
                    <p className="text-gray-600 dark:text-gray-300">(11) 88888-8888</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Horário de Atendimento</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Segunda a sexta: 9h às 18h<br />
                      Sábado: 9h às 12h
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Resposta Garantida</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Até 15 dias úteis (conforme LGPD)
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-red-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Documentação</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Solicite via e-mail
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Urgências</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Incidentes de segurança: 24h
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DPO Responsibilities */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" />
              Responsabilidades do DPO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Atividades Principais</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                    <span>Orientar funcionários sobre conformidade LGPD</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                    <span>Realizar auditorias de proteção de dados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                    <span>Atender solicitações de titulares de dados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                    <span>Comunicar-se com a ANPD quando necessário</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Serviços Oferecidos</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                    <span>Consultoria em proteção de dados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                    <span>Treinamentos e capacitações</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                    <span>Análise de impacto à proteção de dados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                    <span>Resposta a incidentes de segurança</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Contact */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-purple-600" />
              Como Entrar em Contato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Para Solicitações de Dados</h4>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                    <strong>E-mail:</strong> dpo@almanaquedafala.com.br
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                    <strong>Assunto:</strong> Solicitação de Dados Pessoais - [Seu Nome]
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Inclua:</strong> Nome completo, e-mail cadastrado, descrição da solicitação
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Para Reclamações</h4>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <p className="text-sm text-orange-800 dark:text-orange-200 mb-2">
                    <strong>E-mail:</strong> dpo@almanaquedafala.com.br
                  </p>
                  <p className="text-sm text-orange-800 dark:text-orange-200 mb-2">
                    <strong>Assunto:</strong> Reclamação LGPD - [Seu Nome]
                  </p>
                  <p className="text-sm text-orange-800 dark:text-orange-200">
                    <strong>Inclua:</strong> Descrição detalhada do problema, evidências, expectativa de resolução
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Para Incidentes de Segurança</h4>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200 mb-2">
                    <strong>E-mail:</strong> dpo@almanaquedafala.com.br
                  </p>
                  <p className="text-sm text-red-800 dark:text-red-200 mb-2">
                    <strong>Assunto:</strong> URGENTE - Incidente de Segurança
                  </p>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    <strong>Inclua:</strong> Descrição do incidente, dados afetados, medidas tomadas
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Times */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Prazos de Resposta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Solicitações Gerais</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">15 dias úteis</p>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Reclamações</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">10 dias úteis</p>
              </div>
              
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <Shield className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Incidentes</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">24 horas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Formulário de Contato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg text-center">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Entre em Contato Conosco
              </h4>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Use o formulário abaixo para enviar sua solicitação diretamente ao DPO.
              </p>
              <Button asChild>
                <a href="mailto:dpo@almanaquedafala.com.br?subject=Contato DPO - Solicitação de Dados">
                  Enviar E-mail
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          <p>
            Dr. Carlos Silva - Encarregado de Dados (DPO) conforme Art. 41 da LGPD
          </p>
          <p className="mt-2">
            <strong>Almanaque da Fala Tecnologia Ltda.</strong> | CNPJ: 12.345.678/0001-90 | São Paulo, 15 de dezembro de 2024
          </p>
        </div>
      </div>
    </div>
  );
}

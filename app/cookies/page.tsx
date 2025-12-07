import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Cookie,
  Settings,
  Shield,
  BarChart3,
  Target,
  AlertCircle,
} from 'lucide-react';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Política de Cookies
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Almanaque da Fala - Almanaque da Fala
          </p>
          <Badge variant="outline" className="mt-2">
            Última atualização: 15 de dezembro de 2024
          </Badge>
        </div>

        {/* What are Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-orange-600" />O que são Cookies?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Cookies são pequenos arquivos de texto armazenados no seu
              dispositivo quando você visita nosso site. Eles nos ajudam a
              melhorar sua experiência, personalizar conteúdo e analisar como
              você usa nossos serviços.
            </p>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                <strong>Importante:</strong> Você pode controlar e gerenciar
                cookies através das configurações do seu navegador ou usando
                nosso painel de preferências de cookies.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Types of Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Tipos de Cookies que Utilizamos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  Cookies Essenciais
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Necessários para o funcionamento básico do site e segurança.
                </p>
                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <li>• Autenticação de usuários</li>
                  <li>• Prevenção de fraudes</li>
                  <li>• Carregamento de páginas</li>
                  <li>• Preferências de idioma</li>
                </ul>
                <Badge variant="secondary" className="mt-2">
                  Sempre Ativo
                </Badge>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  Cookies Analíticos
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Coletam informações sobre como você usa nosso site.
                </p>
                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <li>• Páginas visitadas</li>
                  <li>• Tempo de permanência</li>
                  <li>• Origem do tráfego</li>
                  <li>• Erros encontrados</li>
                </ul>
                <Badge variant="outline" className="mt-2">
                  Opcional
                </Badge>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Settings className="h-4 w-4 text-purple-600" />
                  Cookies Funcionais
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Melhoram a funcionalidade e personalização do site.
                </p>
                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <li>• Preferências de interface</li>
                  <li>• Configurações de tema</li>
                  <li>• Lembretes de login</li>
                  <li>• Configurações de notificação</li>
                </ul>
                <Badge variant="outline" className="mt-2">
                  Opcional
                </Badge>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-red-600" />
                  Cookies de Marketing
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Usados para exibir anúncios relevantes e medir campanhas.
                </p>
                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <li>• Anúncios personalizados</li>
                  <li>• Medição de campanhas</li>
                  <li>• Remarketing</li>
                  <li>• Redes sociais</li>
                </ul>
                <Badge variant="outline" className="mt-2">
                  Opcional
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Details Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              Detalhes dos Cookies Utilizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-semibold text-gray-900 dark:text-white">
                      Nome
                    </th>
                    <th className="text-left py-2 font-semibold text-gray-900 dark:text-white">
                      Tipo
                    </th>
                    <th className="text-left py-2 font-semibold text-gray-900 dark:text-white">
                      Finalidade
                    </th>
                    <th className="text-left py-2 font-semibold text-gray-900 dark:text-white">
                      Duração
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 dark:text-gray-300">
                  <tr className="border-b">
                    <td className="py-2 font-mono text-xs">session_id</td>
                    <td className="py-2">Essencial</td>
                    <td className="py-2">Manter sessão do usuário</td>
                    <td className="py-2">Sessão</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-mono text-xs">auth_token</td>
                    <td className="py-2">Essencial</td>
                    <td className="py-2">Autenticação segura</td>
                    <td className="py-2">30 dias</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-mono text-xs">_ga</td>
                    <td className="py-2">Analítico</td>
                    <td className="py-2">Google Analytics</td>
                    <td className="py-2">2 anos</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-mono text-xs">_gid</td>
                    <td className="py-2">Analítico</td>
                    <td className="py-2">Google Analytics</td>
                    <td className="py-2">24 horas</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-mono text-xs">preferences</td>
                    <td className="py-2">Funcional</td>
                    <td className="py-2">Preferências do usuário</td>
                    <td className="py-2">1 ano</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-mono text-xs">theme</td>
                    <td className="py-2">Funcional</td>
                    <td className="py-2">Tema da interface</td>
                    <td className="py-2">1 ano</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono text-xs">marketing</td>
                    <td className="py-2">Marketing</td>
                    <td className="py-2">Anúncios personalizados</td>
                    <td className="py-2">90 dias</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Third Party Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Cookies de Terceiros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Utilizamos serviços de terceiros que podem definir cookies em seu
              dispositivo:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="border rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Google Analytics
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Análise de tráfego e comportamento dos usuários
                  </p>
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Política de Privacidade do Google
                  </a>
                </div>

                <div className="border rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Clerk
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Autenticação e gerenciamento de usuários
                  </p>
                  <a
                    href="https://clerk.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Política de Privacidade do Clerk
                  </a>
                </div>
              </div>

              <div className="space-y-3">
                <div className="border rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Stripe
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Processamento de pagamentos
                  </p>
                  <a
                    href="https://stripe.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Política de Privacidade do Stripe
                  </a>
                </div>

                <div className="border rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    AWS
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Armazenamento e infraestrutura
                  </p>
                  <a
                    href="https://aws.amazon.com/privacy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Política de Privacidade da AWS
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Manage Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-green-600" />
              Como Gerenciar Cookies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Painel de Preferências
              </h4>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Você pode gerenciar suas preferências de cookies usando nosso
                painel interativo:
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>Painel de Cookies:</strong> Clique no botão
                  "Configurar Cookies" no rodapé do site para ajustar suas
                  preferências a qualquer momento.
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Configurações do Navegador
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                    Chrome
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Configurações → Privacidade e segurança → Cookies e outros
                    dados do site
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                    Firefox
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Opções → Privacidade e Segurança → Cookies e dados do site
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                    Safari
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Preferências → Privacidade → Gerenciar dados do site
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                    Edge
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Configurações → Cookies e permissões do site → Cookies e
                    dados armazenados
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Impact of Disabling Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Impacto de Desabilitar Cookies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Cookies Essenciais
                </h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Site pode não funcionar corretamente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Impossibilidade de fazer login</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Perda de preferências básicas</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Cookies Opcionais
                </h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Experiência menos personalizada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Análises limitadas de uso</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Anúncios menos relevantes</span>
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
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Contato e Dúvidas
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
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          <p>
            Esta Política de Cookies foi elaborada em conformidade com a Lei
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

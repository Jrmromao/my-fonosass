# 🏥 FonoSaaS - Almanaque da Fala

**Solução completa para fonoaudiólogos brasileiros**

---

## 🧠 **Para Desenvolvedores e IA**

**⚠️ IMPORTANTE**: Antes de fazer qualquer alteração, leia a **base de conhecimento completa**:

### 📚 **Documentação Essencial**
- **[Base de Conhecimento](./docs/knowledge-base/index.md)** - Guia completo para IA
- **[Resumo Executivo](./docs/knowledge-base/SUMMARY.md)** - Visão geral completa
- **[Referência Rápida](./docs/knowledge-base/cursor-quick-reference.md)** - Para trabalho diário
- **[Guias de Desenvolvimento](./docs/knowledge-base/development-guidelines.md)** - Padrões de código
- **[Erros e Soluções](./docs/knowledge-base/mistakes-and-solutions.md)** - Lições aprendidas
- **[Configuração Cursor](./.cursor/README.md)** - Configuração do Cursor AI

---

## 🚨 **REGRAS CRÍTICAS - NUNCA QUEBRAR**

### **Segurança e LGPD (MAIS IMPORTANTE)**:
- ❌ **NUNCA** hardcode senhas, emails ou dados pessoais
- ❌ **NUNCA** remova recursos de conformidade LGPD
- ❌ **NUNCA** pule validação de entrada
- ❌ **NUNCA** remova verificações de autenticação
- ✅ **SEMPRE** use variáveis de ambiente para dados sensíveis
- ✅ **SEMPRE** valide entradas com schemas Zod
- ✅ **SEMPRE** mantenha suporte ao português

### **Regras Técnicas**:
- ❌ **NUNCA** use tipo `any` em TypeScript
- ❌ **NUNCA** chame server actions de client components
- ❌ **NUNCA** atualize para Tailwind CSS v4
- ✅ **SEMPRE** use tipo `unknown` com type guards
- ✅ **SEMPRE** use rotas API para busca de dados do cliente
- ✅ **SEMPRE** mantenha Tailwind CSS v3

---

## 🏗️ **Visão Geral do Projeto**

- **Nome**: FonoSaaS (Almanaque da Fala)
- **Domínio**: almanaquedafala.com.br
- **Propósito**: SaaS para fonoaudiólogos brasileiros
- **Status**: Pronto para Produção ✅
- **Conformidade**: LGPD Compliant ✅
- **Performance**: Otimizado (102kB bundle) ✅

---

## 🛠️ **Stack Tecnológico**

- **Frontend**: Next.js 15.5.3 + TypeScript + Tailwind CSS v3
- **Backend**: Next.js API Routes + Prisma + PostgreSQL
- **Autenticação**: Clerk
- **Pagamentos**: Stripe
- **Armazenamento**: AWS S3
- **Deploy**: Vercel

---

## 🔒 **Conformidade LGPD**

- Política de Privacidade (`/privacidade`)
- Termos de Uso (`/termos`)
- Política de Cookies (`/cookies`)
- Informações LGPD (`/lgpd`)
- Contato DPO (`/dpo`)
- Gerenciamento de Consentimento

---

## 🧪 **Comandos de Desenvolvimento**

```bash
# Desenvolvimento
yarn dev                 # Servidor de desenvolvimento
yarn build              # Build para produção
yarn start              # Servidor de produção

# Testes
yarn test               # Executar todos os testes
yarn test:security      # Testes de segurança
yarn test:coverage      # Cobertura de testes

# Qualidade de Código
yarn lint               # Executar ESLint
yarn lint:fix           # Corrigir problemas ESLint
yarn type-check         # Verificação TypeScript

# Segurança
yarn security:audit     # Auditoria de segurança
yarn security:fix       # Corrigir problemas de segurança
```

---

## 📱 **Funcionalidades Principais**

- Sistema de gestão de pacientes
- Prontuários digitais
- Ferramentas terapêuticas interativas
- Agendamento de consultas
- Cobrança e assinaturas
- Suporte a múltiplos usuários
- Conformidade LGPD completa

---

## 🌐 **Mercado Brasileiro**

- **Idioma**: Português (Brasil)
- **Moeda**: R$ (Real Brasileiro)
- **Formato de Data**: DD/MM/AAAA
- **Formato de Telefone**: (11) 99999-9999
- **Conformidade LGPD**: Obrigatória
- **Regulamentações CFFa**: Seguir regulamentações de fonoaudiologia

---

## 📊 **Métricas de Sucesso**

- **Build Success**: 100% ✅
- **Security Score**: A+ ✅
- **Performance**: Excelente (<150kB bundle) ✅
- **Code Quality**: Alto (ESLint compliant) ✅
- **Test Coverage**: >80% ✅
- **User Experience**: Excelente ✅
- **Market Readiness**: 100% ✅

---

## 🆘 **Precisa de Ajuda?**

1. **Verifique a base de conhecimento primeiro**
2. **Leia a documentação completa**
3. **Consulte códigos similares no projeto**
4. **Peça esclarecimentos em vez de adivinhar**
5. **Priorize segurança e conformidade LGPD**

---

**Lembre-se: Esta é uma aplicação SaaS de saúde brasileira com requisitos rigorosos de conformidade LGPD. Sempre priorize segurança, proteção de dados e experiência do usuário!**
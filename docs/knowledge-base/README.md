# 🧠 FonoSaaS Knowledge Base

**Purpose**: Centralized knowledge repository for AI assistants to understand the project's context, preferences, and development history.

**Last Updated**: December 15, 2024  
**Version**: 1.0

---

## 📋 **Table of Contents**

1. [Project Overview](#project-overview)
2. [Development Preferences](#development-preferences)
3. [Architecture & Tech Stack](#architecture--tech-stack)
4. [Code Standards](#code-standards)
5. [Security Requirements](#security-requirements)
6. [LGPD Compliance](#lgpd-compliance)
7. [Past Mistakes & Lessons Learned](#past-mistakes--lessons-learned)
8. [Development Workflow](#development-workflow)
9. [Testing Strategy](#testing-strategy)
10. [Deployment & Environment](#deployment--environment)

---

## 🎯 **Project Overview**

### **Application Name**: FonoSaaS (Almanaque da Fala)
- **Domain**: almanaquedafala.com.br
- **Target Market**: Brazilian fonoaudiologists
- **Business Model**: SaaS subscription (R$ 97-497/month)
- **Stage**: Production-ready with LGPD compliance

### **Core Features**:
- Patient management system
- Digital medical records (prontuários)
- Interactive therapeutic tools
- Appointment scheduling
- Billing and subscription management
- Multi-user clinic support

---

## ⚙️ **Development Preferences**

### **Code Style**:
- **Language**: TypeScript (strict mode)
- **Framework**: Next.js 15.5.3 with App Router
- **Styling**: Tailwind CSS v3 (NOT v4)
- **State Management**: React hooks + Zustand (when needed)
- **Database**: PostgreSQL with Prisma ORM

### **File Organization**:
```
/app
  /api          # API routes
  /dashboard    # Dashboard pages
  /privacidade  # Legal pages
  /termos       # Legal pages
  /cookies      # Legal pages
  /lgpd         # Legal pages
  /dpo          # Legal pages
/components
  /ui           # ShadCN UI components
  /legal        # Legal compliance components
  /layout       # Layout components
/lib
  /actions      # Server actions
  /security     # Security utilities
  /utils        # Helper functions
```

### **Naming Conventions**:
- **Files**: kebab-case (e.g., `user-profile.tsx`)
- **Components**: PascalCase (e.g., `UserProfile`)
- **Functions**: camelCase (e.g., `getUserData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Database**: snake_case (e.g., `user_profiles`)

---

## 🏗️ **Architecture & Tech Stack**

### **Frontend**:
- Next.js 15.5.3 (App Router)
- React 18
- TypeScript (strict)
- Tailwind CSS v3
- ShadCN UI components
- Framer Motion (animations)
- React Hook Form + Zod validation

### **Backend**:
- Next.js API Routes
- Prisma ORM
- PostgreSQL database
- Clerk authentication
- Stripe payments
- AWS S3 storage

### **External Services**:
- **Authentication**: Clerk
- **Payments**: Stripe
- **Storage**: AWS S3
- **Email**: Resend
- **Analytics**: Vercel Analytics + Google Analytics

### **Development Tools**:
- ESLint v9 (flat config)
- Prettier
- Husky (pre-commit hooks)
- Jest (testing)
- TypeScript compiler

---

## 📏 **Code Standards**

### **TypeScript**:
- Always use strict mode
- Prefer `interface` over `type` for objects
- Use proper error handling with `unknown` type
- Avoid `any` type (use `unknown` instead)
- Use proper type guards

### **React**:
- Prefer functional components
- Use hooks properly (no conditional hooks)
- Implement proper error boundaries
- Use `useCallback` and `useMemo` for optimization
- Prefer composition over inheritance

### **Next.js**:
- Use App Router (not Pages Router)
- Implement proper loading states
- Use Server Components when possible
- Client Components only when necessary
- Proper SEO with metadata

### **Security**:
- Always validate input with Zod schemas
- Sanitize user inputs
- Use proper authentication checks
- Implement rate limiting
- Follow LGPD compliance

---

## 🔒 **Security Requirements**

### **LGPD Compliance** (CRITICAL):
- All personal data must be properly protected
- Consent management required
- Data subject rights implementation
- DPO contact information available
- Privacy policy and terms of service
- Cookie policy and management

### **Authentication**:
- Clerk for user management
- Role-based access control
- Session management
- Password policies

### **Data Protection**:
- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.2+)
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### **API Security**:
- Rate limiting (tiered)
- CORS configuration
- Input validation
- Error handling (no sensitive data exposure)
- Authentication on all endpoints

---

## 🇧🇷 **LGPD Compliance**

### **Legal Pages** (MUST BE MAINTAINED):
- `/privacidade` - Privacy Policy
- `/termos` - Terms of Service
- `/cookies` - Cookie Policy
- `/lgpd` - LGPD Information
- `/dpo` - DPO Contact

### **Data Processing**:
- **Bases Legais**: Consentimento, Execução de Contrato, Legítimo Interesse
- **Finalidades**: Prestação de serviços, gestão de usuários, melhorias
- **Retenção**: 2 anos (usuários), 20 anos (pacientes), 5 anos (pagamentos)
- **Direitos**: Acesso, correção, eliminação, portabilidade, oposição

### **Consent Management**:
- ConsentManager component implemented
- Granular cookie control
- Easy consent withdrawal
- Clear information about data use

---

## 🚫 **Past Mistakes & Lessons Learned**

### **1. Tailwind CSS Version Issues**:
- **Mistake**: Upgraded to Tailwind v4 too early
- **Problem**: Breaking changes, PostCSS incompatibility
- **Solution**: Stay with Tailwind v3 for stability
- **Prevention**: Test major version upgrades in separate branch

### **2. Server Actions in Client Components**:
- **Mistake**: Called server actions from client components
- **Problem**: "Server Action" and "Bail out to client-side rendering" errors
- **Solution**: Use API routes for client-side data fetching
- **Prevention**: Clear separation between server and client code

### **3. Dynamic Imports with SSR Issues**:
- **Mistake**: Used `next/dynamic` with `ssr: false` for main components
- **Problem**: "Bail out to client-side rendering" errors
- **Solution**: Regular imports for main components, dynamic only for heavy libraries
- **Prevention**: Test SSR compatibility before using dynamic imports

### **4. TypeScript Error Handling**:
- **Mistake**: Used `any` type in catch blocks
- **Problem**: Type safety issues, potential runtime errors
- **Solution**: Use `unknown` type with proper type guards
- **Prevention**: ESLint rules to prevent `any` usage

### **5. Environment Variables in CI/CD**:
- **Mistake**: Tried to use production secrets in GitHub Actions
- **Problem**: Security risks, build failures
- **Solution**: Use mock values for CI/CD, real values only in Vercel
- **Prevention**: Clear separation between test and production environments

### **6. Hardcoded Credentials**:
- **Mistake**: Hardcoded passwords and emails in code
- **Problem**: Security vulnerability, LGPD violation
- **Solution**: Environment variables, secure password generation
- **Prevention**: Security audits, code reviews

### **7. Missing Input Validation**:
- **Mistake**: Direct use of user input without validation
- **Problem**: Security vulnerabilities, data corruption
- **Solution**: Zod schemas for all inputs, sanitization
- **Prevention**: Input validation as standard practice

---

## 🔄 **Development Workflow**

### **Git Flow**:
- `main` - Production branch
- `develop` - Development branch
- `feature/*` - Feature branches
- `hotfix/*` - Hotfix branches

### **Pre-commit Hooks**:
- ESLint (auto-fix)
- Prettier (formatting)
- TypeScript type checking
- Jest tests (if applicable)

### **Code Review Process**:
1. Create feature branch
2. Implement changes
3. Run tests and linting
4. Create pull request
5. Code review
6. Merge to develop
7. Deploy to staging
8. Merge to main
9. Deploy to production

### **Testing Strategy**:
- Unit tests for utilities and hooks
- Integration tests for API routes
- Security tests for vulnerabilities
- E2E tests for critical user flows

---

## 🧪 **Testing Strategy**

### **Test Types**:
- **Unit Tests**: Individual functions and components
- **Integration Tests**: API routes and database operations
- **Security Tests**: Vulnerability scanning
- **E2E Tests**: Complete user workflows

### **Test Files Structure**:
```
__tests__/
  /unit/           # Unit tests
  /integration/    # Integration tests
  /security/       # Security tests
  /setup/          # Test setup files
```

### **Test Commands**:
- `yarn test` - Run all tests
- `yarn test:security` - Run security tests
- `yarn test:watch` - Watch mode
- `yarn test:coverage` - Coverage report

---

## 🚀 **Deployment & Environment**

### **Environments**:
- **Development**: Local development
- **Staging**: Vercel preview deployments
- **Production**: Vercel production

### **Environment Variables**:
- **Development**: `.env.local`
- **Production**: Vercel dashboard
- **CI/CD**: Mock values for testing

### **Deployment Process**:
1. Push to main branch
2. Vercel automatically builds and deploys
3. Environment variables from Vercel dashboard
4. Health checks and monitoring

### **Monitoring**:
- Vercel Analytics
- Google Analytics
- Error tracking
- Performance monitoring

---

## 📚 **Additional Resources**

### **Documentation**:
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [LGPD Official Text](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

### **Useful Commands**:
```bash
# Development
yarn dev                 # Start development server
yarn build              # Build for production
yarn start              # Start production server

# Testing
yarn test               # Run tests
yarn test:security      # Run security tests
yarn test:coverage      # Run with coverage

# Code Quality
yarn lint               # Run ESLint
yarn lint:fix           # Fix ESLint issues
yarn type-check         # TypeScript type checking

# Security
yarn security:audit     # Security audit
yarn security:fix       # Fix security issues
```

---

## 🎯 **Key Success Metrics**

- **Performance**: First Load JS < 150kB
- **Security**: Zero critical vulnerabilities
- **LGPD Compliance**: 100% compliant
- **Code Quality**: ESLint errors = 0
- **Test Coverage**: > 80%
- **Build Success**: 100% successful builds

---

**This knowledge base should be updated whenever significant changes are made to the project architecture, preferences, or when new lessons are learned.**

# 🧠 FonoSaaS Knowledge Base - Summary

**Complete guide for AI assistants working on this project**

---

## 🎯 **What This Knowledge Base Contains**

This knowledge base is designed to help AI assistants (like Cursor) understand the FonoSaaS project completely, avoid past mistakes, and maintain consistency. It contains:

1. **Project Overview** - What the app does and its purpose
2. **Development Guidelines** - How to code properly
3. **Mistakes & Solutions** - What went wrong and how to fix it
4. **Quick Reference** - Essential info for daily work
5. **Project Status** - Current state and achievements

---

## 🚨 **CRITICAL RULES - NEVER BREAK**

### **Security & LGPD (MOST IMPORTANT)**:
- ❌ **NEVER** hardcode passwords, emails, or personal data
- ❌ **NEVER** remove LGPD compliance features
- ❌ **NEVER** skip input validation
- ❌ **NEVER** remove authentication checks
- ✅ **ALWAYS** use environment variables for sensitive data
- ✅ **ALWAYS** validate inputs with Zod schemas
- ✅ **ALWAYS** maintain Portuguese language support

### **Technical Rules**:
- ❌ **NEVER** use `any` type in TypeScript
- ❌ **NEVER** call server actions from client components
- ❌ **NEVER** upgrade to Tailwind CSS v4
- ✅ **ALWAYS** use `unknown` type with type guards
- ✅ **ALWAYS** use API routes for client-side data fetching
- ✅ **ALWAYS** stay with Tailwind CSS v3

---

## 🏗️ **Project Architecture**

### **What It Is**:
- **Name**: FonoSaaS (Almanaque da Fala)
- **Domain**: almanaquedafala.com.br
- **Purpose**: SaaS for Brazilian fonoaudiologists
- **Market**: Brazil (Portuguese language, LGPD compliance)

### **Tech Stack**:
- **Frontend**: Next.js 15.5.3 + TypeScript + Tailwind CSS v3
- **Backend**: Next.js API Routes + Prisma + PostgreSQL
- **Auth**: Clerk
- **Payments**: Stripe
- **Storage**: AWS S3
- **Deployment**: Vercel

### **Key Features**:
- Patient management system
- Digital medical records (prontuários)
- Interactive therapeutic tools
- Appointment scheduling
- Billing and subscriptions
- Multi-user clinic support

---

## 🔒 **Security & Compliance**

### **LGPD Compliance (MANDATORY)**:
- Privacy Policy (`/privacidade`)
- Terms of Service (`/termos`)
- Cookie Policy (`/cookies`)
- LGPD Information (`/lgpd`)
- DPO Contact (`/dpo`)
- Consent Management (ConsentManager component)

### **Security Measures**:
- Input validation with Zod
- Authentication on all endpoints
- Rate limiting (tiered)
- Security headers
- CSRF protection
- Encryption (AES-256 + TLS 1.2+)

---

## 🚫 **Major Mistakes to Avoid**

### **1. Tailwind CSS v4 Upgrade**:
- **Problem**: Broke PostCSS, caused build failures
- **Solution**: Stay with v3, test major upgrades in separate branch
- **Prevention**: Never upgrade to beta versions in production

### **2. Server Actions in Client Components**:
- **Problem**: "Server Action" and "Bail out to client-side rendering" errors
- **Solution**: Use API routes for client-side data fetching
- **Prevention**: Clear separation between server and client code

### **3. Hardcoded Credentials**:
- **Problem**: Security vulnerability, LGPD violation
- **Solution**: Environment variables, secure password generation
- **Prevention**: Never hardcode sensitive data

### **4. Missing Input Validation**:
- **Problem**: Security vulnerabilities, data corruption
- **Solution**: Zod schemas for all inputs, sanitization
- **Prevention**: Input validation as standard practice

---

## 🎨 **Code Standards**

### **TypeScript**:
- Use strict mode
- Prefer `interface` over `type`
- Use `unknown` type in catch blocks
- Implement proper type guards
- Avoid `any` type

### **React**:
- Prefer functional components
- Use hooks properly
- Implement error boundaries
- Use `useCallback` and `useMemo` for optimization

### **Next.js**:
- Use App Router (not Pages Router)
- Implement proper loading states
- Use Server Components when possible
- Client Components only when necessary

---

## 🧪 **Testing & Quality**

### **Test Commands**:
```bash
yarn test               # Run all tests
yarn test:security      # Run security tests
yarn test:coverage      # Run with coverage
yarn lint               # Run ESLint
yarn lint:fix           # Fix ESLint issues
yarn type-check         # TypeScript checking
yarn build              # Build for production
```

### **Quality Standards**:
- ESLint errors: 0
- TypeScript errors: 0
- Test coverage: >80%
- Build success: 100%
- Performance: First Load JS <150kB

---

## 🌐 **Brazilian Market Requirements**

### **Language & Culture**:
- Portuguese (Brazil) for all user-facing content
- Brazilian date format (DD/MM/YYYY)
- Brazilian currency format (R$)
- Brazilian phone format
- Brazilian address format

### **Legal Requirements**:
- LGPD compliance (mandatory)
- CFFa regulations (fonoaudiologist regulations)
- Brazilian consumer law
- Data protection requirements

---

## 📁 **File Structure**

```
/app
  /api          # API routes (server-side only)
  /dashboard    # Dashboard pages
  /privacidade  # Privacy policy (LGPD)
  /termos       # Terms of service
  /cookies      # Cookie policy
  /lgpd         # LGPD information
  /dpo          # DPO contact page
/components
  /ui           # ShadCN UI components
  /legal        # Legal compliance components
  /layout       # Layout components
/lib
  /actions      # Server actions
  /security     # Security utilities
  /utils        # Helper functions
docs/
  /knowledge-base/  # This knowledge base
  /legal/          # Legal documents
  /api/            # API documentation
```

---

## 🚀 **Deployment & Environment**

### **Environments**:
- **Development**: Local development with `.env.local`
- **Production**: Vercel with environment variables in dashboard
- **CI/CD**: Mock values for testing, real values only in Vercel

### **Deployment Process**:
1. Push to main branch
2. Vercel automatically builds and deploys
3. Environment variables from Vercel dashboard
4. Health checks and monitoring

---

## 📊 **Current Status**

### **Overall**: ✅ **PRODUCTION READY**
- Build: ✅ Successful (31 pages)
- Security: ✅ LGPD Compliant
- Performance: ✅ Optimized (102kB bundle)
- Code Quality: ✅ ESLint compliant
- Testing: ✅ Comprehensive

### **Features**: ✅ **COMPLETE**
- All core features implemented
- Legal compliance complete
- Security measures in place
- Performance optimized
- Brazilian market ready

---

## 🆘 **When You Need Help**

### **Check These First**:
1. **This knowledge base** - Most questions answered here
2. **Development guidelines** - How to code properly
3. **Mistakes & solutions** - Common problems and fixes
4. **Quick reference** - Essential daily information

### **If Still Unsure**:
1. **Look at similar code** in the codebase
2. **Check the project status** for current state
3. **Ask for clarification** rather than guessing
4. **Prioritize security and LGPD compliance**

---

## 🎯 **Success Metrics**

- **Build Success**: 100%
- **Security Score**: A+ (LGPD compliant)
- **Performance**: Excellent (<150kB bundle)
- **Code Quality**: High (ESLint compliant)
- **Test Coverage**: >80%
- **User Experience**: Excellent
- **Market Readiness**: 100%

---

## 📚 **Key Resources**

### **Documentation**:
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Prisma](https://www.prisma.io/docs)
- [Clerk](https://clerk.com/docs)
- [LGPD Official Text](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

### **Project Files**:
- `app/layout.tsx` - Root layout with ConsentManager
- `components/legal/ConsentManager.tsx` - Cookie consent
- `middleware.ts` - Authentication and rate limiting
- `next.config.ts` - Security headers
- `lib/security/validation.ts` - Input validation

---

**Remember: This is a Brazilian healthcare SaaS application with strict LGPD compliance requirements. Always prioritize security, data protection, and user experience. When in doubt, check this knowledge base first!**

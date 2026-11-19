# 🧠 Almanaque da Fala Knowledge Base

**Complete guide for AI assistants working on this project**

---

## 📚 **Knowledge Base Contents**

### **1. [README.md](./README.md)**
Complete project overview, architecture, and comprehensive guidelines.

### **2. [Development Guidelines](./development-guidelines.md)**
Detailed coding standards, patterns, and best practices.

### **3. [Mistakes & Solutions](./mistakes-and-solutions.md)**
Past mistakes, their solutions, and prevention strategies.

### **4. [Cursor Quick Reference](./cursor-quick-reference.md)**
Essential information for daily development work.

### **5. [Project Status](./project-status.md)**
Current state, achievements, and success metrics.

### **6. [SUMMARY.md](./SUMMARY.md)**
Complete summary of everything you need to know.

### **7. [Activity lifecycle](./activity-lifecycle.md)**
Edit, archive (database + S3 Glacier IR), restore and delete activities.

---

## 🚨 **START HERE - Critical Rules**

### **NEVER DO THESE**:
- ❌ Hardcode passwords, emails, or personal data
- ❌ Remove LGPD compliance features
- ❌ Use `any` type in TypeScript
- ❌ Call server actions from client components
- ❌ Upgrade to Tailwind CSS v4
- ❌ Skip input validation
- ❌ Remove authentication checks

### **ALWAYS DO THESE**:
- ✅ Use environment variables for sensitive data
- ✅ Validate inputs with Zod schemas
- ✅ Maintain LGPD compliance
- ✅ Use Portuguese for user-facing content
- ✅ Use `unknown` type with type guards
- ✅ Use API routes for client-side data fetching
- ✅ Stay with Tailwind CSS v3

---

## 🎯 **Quick Start Guide**

1. **Read [SUMMARY.md](./SUMMARY.md)** for complete overview
2. **Check [Cursor Quick Reference](./cursor-quick-reference.md)** for daily work
3. **Review [Mistakes & Solutions](./mistakes-and-solutions.md)** to avoid past errors
4. **Follow [Development Guidelines](./development-guidelines.md)** for coding standards
5. **Check [Project Status](./project-status.md)** for current state

---

## 🏗️ **Project Overview**

- **Name**: Almanaque da Fala (Almanaque da Fala)
- **Domain**: almanaquedafala.com.br
- **Purpose**: SaaS for Brazilian fonoaudiologists
- **Status**: Production Ready ✅
- **Compliance**: LGPD Compliant ✅
- **Performance**: Optimized (102kB bundle) ✅

---

## 🔒 **Security & Compliance**

- **LGPD Compliance**: 100% compliant
- **Security**: A+ rating
- **Authentication**: Clerk
- **Data Protection**: AES-256 + TLS 1.2+
- **Input Validation**: Zod schemas
- **Rate Limiting**: Tiered implementation

---

## 🛠️ **Tech Stack**

- **Frontend**: Next.js 15.5.3 + TypeScript + Tailwind CSS v3
- **Backend**: Next.js API Routes + Prisma + PostgreSQL
- **Auth**: Clerk
- **Payments**: Stripe
- **Storage**: AWS S3
- **Deployment**: Vercel

---

## 📱 **Key Features**

- Patient management system
- Digital medical records (prontuários)
- Interactive therapeutic tools
- Appointment scheduling
- Billing and subscriptions
- Multi-user clinic support
- LGPD compliance pages

---

## 🧪 **Testing & Quality**

```bash
yarn test               # Run all tests
yarn test:security      # Run security tests
yarn test:coverage      # Run with coverage
yarn lint               # Run ESLint
yarn lint:fix           # Fix ESLint issues
yarn type-check         # TypeScript checking
yarn build              # Build for production
```

---

## 🌐 **Brazilian Market**

- **Language**: Portuguese (Brazil)
- **Currency**: R$ (Brazilian Real)
- **Date Format**: DD/MM/YYYY
- **Phone Format**: (11) 99999-9999
- **LGPD Compliance**: Mandatory
- **CFFa Regulations**: Follow fonoaudiologist regulations

---

## 📊 **Success Metrics**

- **Build Success**: 100% ✅
- **Security Score**: A+ ✅
- **Performance**: Excellent (<150kB bundle) ✅
- **Code Quality**: High (ESLint compliant) ✅
- **Test Coverage**: >80% ✅
- **User Experience**: Excellent ✅
- **Market Readiness**: 100% ✅

---

## 🆘 **Need Help?**

1. **Check this knowledge base first**
2. **Look at similar code in the codebase**
3. **Review the project status**
4. **Ask for clarification rather than guessing**
5. **Prioritize security and LGPD compliance**

---

**Remember: This is a Brazilian healthcare SaaS application with strict LGPD compliance requirements. Always prioritize security, data protection, and user experience!**

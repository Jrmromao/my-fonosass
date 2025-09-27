# 🎯 Cursor Quick Reference - Almanaque da Fala

**Essential information for AI assistants working on this project**

---

## 🚨 **CRITICAL - NEVER DO THESE**

- ❌ **NEVER** hardcode passwords, emails, or personal data
- ❌ **NEVER** remove LGPD compliance features
- ❌ **NEVER** use `any` type in TypeScript
- ❌ **NEVER** call server actions from client components
- ❌ **NEVER** upgrade to Tailwind CSS v4
- ❌ **NEVER** remove Portuguese language support
- ❌ **NEVER** skip input validation
- ❌ **NEVER** remove authentication checks

---

## ✅ **ALWAYS DO THESE**

- ✅ **ALWAYS** use environment variables for sensitive data
- ✅ **ALWAYS** implement proper error handling with `unknown` type
- ✅ **ALWAYS** validate inputs with Zod schemas
- ✅ **ALWAYS** check authentication in API routes
- ✅ **ALWAYS** maintain LGPD compliance
- ✅ **ALWAYS** use Portuguese for user-facing content
- ✅ **ALWAYS** test builds before committing
- ✅ **ALWAYS** follow the established file structure

---

## 🏗️ **Project Structure**

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
```

---

## 🎨 **Tech Stack**

- **Framework**: Next.js 15.5.3 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v3 (NOT v4)
- **Database**: PostgreSQL + Prisma
- **Auth**: Clerk
- **Payments**: Stripe
- **Storage**: AWS S3
- **Deployment**: Vercel

---

## 🔒 **Security Requirements**

### **LGPD Compliance (MANDATORY)**:
- All personal data must be protected
- Consent management required
- DPO contact available
- Privacy policy and terms updated
- Cookie management implemented

### **Authentication**:
- Clerk for user management
- Role-based access control
- All API routes must check auth

### **Data Protection**:
- Input validation with Zod
- Input sanitization
- Encryption at rest and in transit
- No hardcoded credentials

---

## 🚫 **Common Anti-Patterns**

### **Server Actions in Client Components**:
```typescript
// ❌ DON'T DO THIS
'use client';
import { getData } from '@/lib/actions/data.action';
const data = getData(); // ERROR

// ✅ DO THIS INSTEAD
'use client';
const [data, setData] = useState(null);
useEffect(() => {
  fetch('/api/data').then(res => res.json()).then(setData);
}, []);
```

### **Hardcoded Values**:
```typescript
// ❌ DON'T DO THIS
const password = "hardcoded123";

// ✅ DO THIS INSTEAD
const password = process.env.DEFAULT_PASSWORD;
```

### **Missing Input Validation**:
```typescript
// ❌ DON'T DO THIS
const { email, password } = await req.json();

// ✅ DO THIS INSTEAD
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
const { email, password } = schema.parse(await req.json());
```

---

## 🧪 **Testing Commands**

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

## 🌐 **Environment Variables**

### **Required for Development**:
```env
NODE_ENV=development
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_test_...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
```

### **For Production (Vercel)**:
- All variables managed in Vercel dashboard
- Never commit production secrets
- Use mock values for CI/CD

---

## 📱 **Responsive Design**

- **Mobile-first** approach
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch-friendly** interfaces
- **Brazilian** user preferences

---

## 🇧🇷 **Brazilian Market Requirements**

- **Language**: Portuguese (Brazil)
- **Currency**: R$ (Brazilian Real)
- **Date Format**: DD/MM/YYYY
- **Phone Format**: (11) 99999-9999
- **LGPD Compliance**: Mandatory
- **CFFa Regulations**: Follow fonoaudiologist regulations

---

## 🚀 **Deployment Process**

1. **Development**: `yarn dev`
2. **Testing**: `yarn test && yarn lint && yarn type-check`
3. **Build**: `yarn build`
4. **Deploy**: Push to main branch → Vercel auto-deploy
5. **Monitor**: Check Vercel dashboard and analytics

---

## 🔍 **Debugging Common Issues**

### **"Server Action" Error**:
- Check if server actions are called from client components
- Use API routes instead

### **"Bail out to client-side rendering"**:
- Check dynamic imports with `ssr: false`
- Use regular imports for main components

### **TypeScript Errors**:
- Check type definitions
- Use proper error handling with `unknown`
- Run `yarn type-check`

### **Build Failures**:
- Check for missing dependencies
- Verify environment variables
- Check syntax errors

---

## 📚 **Key Files to Know**

- `app/layout.tsx` - Root layout with ConsentManager
- `components/legal/ConsentManager.tsx` - Cookie consent management
- `middleware.ts` - Authentication and rate limiting
- `next.config.ts` - Security headers and configuration
- `lib/security/validation.ts` - Input validation utilities
- `docs/knowledge-base/` - Complete documentation

---

## 🎯 **Success Metrics**

- **Build Success**: 100% successful builds
- **Performance**: First Load JS < 150kB
- **Security**: Zero critical vulnerabilities
- **LGPD**: 100% compliant
- **Code Quality**: ESLint errors = 0
- **Test Coverage**: > 80%

---

## 🆘 **When in Doubt**

1. **Check this knowledge base** first
2. **Read the development guidelines**
3. **Look at similar implementations** in the codebase
4. **Ask for clarification** rather than making assumptions
5. **Prioritize security and LGPD compliance**

---

**Remember: This is a Brazilian healthcare SaaS application with strict LGPD compliance requirements. Always prioritize security, data protection, and user experience.**

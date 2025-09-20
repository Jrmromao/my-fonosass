# 🛠️ FonoSaaS Development Guidelines

**For AI Assistants and Developers**

---

## 🚨 **CRITICAL RULES - NEVER BREAK THESE**

### **1. LGPD Compliance is MANDATORY**
- ❌ **NEVER** hardcode personal data (emails, passwords, names)
- ❌ **NEVER** remove consent management
- ❌ **NEVER** bypass data validation
- ✅ **ALWAYS** use environment variables for sensitive data
- ✅ **ALWAYS** implement proper consent management
- ✅ **ALWAYS** validate and sanitize user inputs

### **2. Security First**
- ❌ **NEVER** use `any` type in TypeScript
- ❌ **NEVER** expose sensitive data in logs
- ❌ **NEVER** skip authentication checks
- ✅ **ALWAYS** use `unknown` type with type guards
- ✅ **ALWAYS** implement proper error handling
- ✅ **ALWAYS** validate all inputs with Zod

### **3. Brazilian Market Requirements**
- ❌ **NEVER** remove Portuguese language support
- ❌ **NEVER** ignore CFFa regulations
- ❌ **NEVER** remove DPO contact information
- ✅ **ALWAYS** maintain Portuguese content
- ✅ **ALWAYS** follow Brazilian data protection laws
- ✅ **ALWAYS** keep DPO information updated

---

## 🎯 **Development Patterns**

### **Component Creation**:
```typescript
// ✅ GOOD - Proper component structure
'use client'; // Only if needed

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ComponentProps {
  title: string;
  children: React.ReactNode;
}

export default function Component({ title, children }: ComponentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
```

### **API Route Creation**:
```typescript
// ✅ GOOD - Proper API route structure
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

const schema = z.object({
  // Define schema
});

export async function POST(req: Request) {
  try {
    // 1. Authentication check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Input validation
    const body = await req.json();
    const validatedData = schema.parse(body);

    // 3. Business logic
    // ... implementation

    // 4. Response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### **Error Handling**:
```typescript
// ✅ GOOD - Proper error handling
try {
  // Some operation
} catch (error) {
  console.error('Operation failed:', error);
  
  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
  
  return NextResponse.json(
    { error: 'Unknown error occurred' },
    { status: 500 }
  );
}
```

---

## 🚫 **Common Anti-Patterns to Avoid**

### **1. Server Actions in Client Components**:
```typescript
// ❌ BAD - Don't do this
'use client';
import { getData } from '@/lib/actions/data.action';

export default function ClientComponent() {
  const data = getData(); // This will cause errors
  return <div>{data}</div>;
}

// ✅ GOOD - Use API routes instead
'use client';
import { useEffect, useState } from 'react';

export default function ClientComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);
  
  return <div>{data}</div>;
}
```

### **2. Hardcoded Values**:
```typescript
// ❌ BAD - Hardcoded values
const password = "MERDAP@ssword2023!";
const email = "admin@example.com";

// ✅ GOOD - Environment variables
const password = process.env.DEFAULT_PASSWORD;
const email = process.env.ADMIN_EMAIL;
```

### **3. Missing Input Validation**:
```typescript
// ❌ BAD - No validation
export async function POST(req: Request) {
  const { email, password } = await req.json();
  // Direct use without validation
}

// ✅ GOOD - With validation
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = schema.parse(body);
}
```

---

## 🏗️ **Architecture Decisions**

### **Why Tailwind CSS v3 (NOT v4)**:
- v4 is still in beta and has breaking changes
- v3 is stable and well-documented
- PostCSS integration works perfectly with v3
- No need to upgrade until v4 is stable

### **Why App Router (NOT Pages Router)**:
- App Router is the future of Next.js
- Better performance and SEO
- Server Components by default
- Better TypeScript support

### **Why Prisma (NOT raw SQL)**:
- Type-safe database queries
- Automatic migrations
- Better developer experience
- Built-in connection pooling

### **Why Clerk (NOT custom auth)**:
- LGPD compliance built-in
- Brazilian localization
- Security best practices
- Reduces development time

---

## 🔧 **Development Workflow**

### **Before Starting Work**:
1. Read this knowledge base
2. Check existing similar implementations
3. Understand the business requirements
4. Plan the implementation approach

### **During Development**:
1. Follow TypeScript strict mode
2. Implement proper error handling
3. Add input validation
4. Test locally
5. Run linting and type checking

### **Before Committing**:
1. Run `yarn lint:fix`
2. Run `yarn type-check`
3. Run `yarn test` (if applicable)
4. Test the functionality manually
5. Check for security issues

### **Code Review Checklist**:
- [ ] LGPD compliance maintained
- [ ] Security best practices followed
- [ ] TypeScript types are correct
- [ ] Error handling implemented
- [ ] Input validation added
- [ ] No hardcoded values
- [ ] Portuguese language support
- [ ] Performance considerations

---

## 🧪 **Testing Requirements**

### **Unit Tests**:
- Test utility functions
- Test custom hooks
- Test component logic
- Mock external dependencies

### **Integration Tests**:
- Test API routes
- Test database operations
- Test authentication flows
- Test payment processing

### **Security Tests**:
- Test input validation
- Test authentication
- Test authorization
- Test data protection

---

## 📱 **Responsive Design**

### **Breakpoints**:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### **Design Principles**:
- Mobile-first approach
- Touch-friendly interfaces
- Accessible design
- Brazilian user preferences

---

## 🌐 **Internationalization**

### **Language Support**:
- Primary: Portuguese (Brazil)
- Fallback: English (if needed)
- All user-facing text in Portuguese
- Technical documentation in English

### **Cultural Considerations**:
- Brazilian date format (DD/MM/YYYY)
- Brazilian currency format (R$)
- Brazilian phone number format
- Brazilian address format

---

## 🔍 **Debugging Guidelines**

### **Common Issues**:
1. **"Server Action" errors**: Check if server actions are called from client components
2. **"Bail out to client-side rendering"**: Check dynamic imports and SSR
3. **TypeScript errors**: Check type definitions and imports
4. **Build failures**: Check for missing dependencies or syntax errors

### **Debugging Steps**:
1. Check browser console for errors
2. Check terminal for build errors
3. Check network tab for API errors
4. Check database for data issues
5. Check environment variables

---

## 📊 **Performance Guidelines**

### **Bundle Size**:
- Keep First Load JS under 150kB
- Use dynamic imports for heavy libraries
- Optimize images with Next.js Image
- Remove unused dependencies

### **Database Performance**:
- Use proper indexes
- Implement pagination
- Use connection pooling
- Monitor query performance

---

## 🚀 **Deployment Guidelines**

### **Environment Variables**:
- Development: `.env.local`
- Production: Vercel dashboard
- Never commit sensitive data
- Use mock values for CI/CD

### **Build Process**:
1. TypeScript compilation
2. ESLint checking
3. Prettier formatting
4. Next.js build
5. Static generation
6. Deployment to Vercel

---

## 📚 **Learning Resources**

### **Documentation**:
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Prisma](https://www.prisma.io/docs)
- [Clerk](https://clerk.com/docs)
- [LGPD](https://www.gov.br/anpd/pt-br)

### **Best Practices**:
- [React Best Practices](https://react.dev/learn)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)
- [Security Best Practices](https://owasp.org/www-project-top-ten/)
- [LGPD Compliance](https://www.gov.br/anpd/pt-br)

---

**Remember: When in doubt, prioritize security, LGPD compliance, and user experience. It's better to ask for clarification than to make assumptions that could break the application or violate regulations.**

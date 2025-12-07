# 🚀 Almanaque da Fala Feature Development Guide

**Created**: September 2025 
**Purpose**: Comprehensive guide for creating new features in the Almanaque da Fala application  
**Status**: Active - Use as reference for all feature development

---

## 📋 **Table of Contents**

1. [Overview](#overview)
2. [Architecture Standards](#architecture-standards)
3. [Feature Development Process](#feature-development-process)
4. [Code Organization Patterns](#code-organization-patterns)
5. [Database Schema Patterns](#database-schema-patterns)
6. [API Route Standards](#api-route-standards)
7. [Component Development](#component-development)
8. [Testing Requirements](#testing-requirements)
9. [Security Guidelines](#security-guidelines)
10. [Deployment Checklist](#deployment-checklist)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 **Overview**

This guide establishes the standards and patterns for developing new features in the Almanaque da fala application. It ensures consistency, maintainability, and scalability across all development work.

### **Core Principles**
- **Clean Code**: Meaningful names, small functions, single responsibility
- **Testable Code**: Pure functions, dependency injection, mockable services
- **Security First**: Input validation, authentication, authorization
- **Performance**: Optimized queries, efficient rendering, proper caching
- **Accessibility**: WCAG compliance, keyboard navigation, screen readers

---

## 🏗️ **Architecture Standards**

### **Technology Stack**
- **Frontend**: Next.js 14+ (App Router), React 18+, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL
- **Authentication**: Clerk
- **Styling**: Tailwind CSS, Shadcn UI
- **State Management**: React Query (TanStack Query)
- **File Storage**: AWS S3
- **Testing**: Jest, React Testing Library
- **Validation**: Zod

### **Project Structure**
```
my-fonosass/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   ├── forms/            # Form components
│   ├── dialogs/          # Modal dialogs
│   └── layout/           # Layout components
├── lib/                  # Utility functions
├── hooks/                # Custom React hooks
├── services/             # External service integrations
├── types/                # TypeScript type definitions
├── prisma/               # Database schema and migrations
├── __tests__/            # Test files
└── docs/                 # Documentation
```

---

## 🔄 **Feature Development Process**

### **Step 1: Planning & Design**
1. **Define Requirements**
   - Clear feature description
   - User stories and acceptance criteria
   - Technical requirements
   - Security considerations

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Database Schema Design**
   - Design Prisma models
   - Plan relationships and constraints
   - Consider indexing and performance

### **Step 2: Database Implementation**
1. **Update Prisma Schema**
   ```prisma
   model YourFeature {
     id        String   @id @default(cuid())
     name      String
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
     
     // Relations
     user      User     @relation(fields: [userId], references: [id])
     userId    String
   }
   ```

2. **Create Migration**
   ```bash
   npx prisma migrate dev --name add-your-feature
   ```

3. **Update Prisma Client**
   ```bash
   npx prisma generate
   ```

### **Step 3: Backend Implementation**
1. **Create API Routes**
   - Follow RESTful conventions
   - Implement proper validation
   - Add authentication checks
   - Handle errors gracefully

2. **Create Service Layer**
   - Business logic separation
   - Database operations
   - External service integrations

3. **Add Type Definitions**
   - TypeScript interfaces
   - API response types
   - Form validation schemas

### **Step 4: Frontend Implementation**
1. **Create Components**
   - Follow component composition patterns
   - Use Shadcn UI components
   - Implement proper TypeScript types
   - Add accessibility features

2. **Create Forms**
   - Use React Hook Form
   - Implement Zod validation
   - Add proper error handling
   - Include loading states

3. **Add State Management**
   - Use React Query for server state
   - Use React state for local state
   - Implement optimistic updates

### **Step 5: Testing**
1. **Unit Tests**
   - Component testing
   - Utility function testing
   - Service layer testing

2. **Integration Tests**
   - API route testing
   - Database operation testing
   - End-to-end workflows

3. **Security Tests**
   - Input validation testing
   - Authentication testing
   - Authorization testing

### **Step 6: Documentation**
1. **Update README**
2. **Add JSDoc comments**
3. **Create feature documentation**
4. **Update API documentation**

---

## 📁 **Code Organization Patterns**

### **Component Structure**
```typescript
// components/feature/FeatureComponent.tsx
'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface FeatureComponentProps {
  title: string
  description?: string
  onAction?: () => void
}

export default function FeatureComponent({ 
  title, 
  description, 
  onAction 
}: FeatureComponentProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="text-muted-foreground mt-2">{description}</p>
      )}
      {onAction && (
        <Button onClick={onAction} className="mt-4">
          Action
        </Button>
      )}
    </Card>
  )
}
```

### **API Route Structure**
```typescript
// app/api/feature/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { z } from 'zod'
import { prisma } from '@/app/db'

const featureSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Input validation
    const body = await request.json()
    const validatedData = featureSchema.parse(body)

    // Business logic
    const feature = await prisma.feature.create({
      data: {
        ...validatedData,
        userId,
      },
    })

    return NextResponse.json({ success: true, data: feature })
  } catch (error) {
    console.error('Feature creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### **Service Layer Pattern**
```typescript
// services/FeatureService.ts
import { prisma } from '@/app/db'

export class FeatureService {
  static async createFeature(data: CreateFeatureInput) {
    return await prisma.feature.create({
      data,
      include: {
        user: true,
      },
    })
  }

  static async getFeaturesByUser(userId: string) {
    return await prisma.feature.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }
}
```

---

## 🗄️ **Database Schema Patterns**

### **Model Naming Conventions**
- Use PascalCase for model names
- Use camelCase for field names
- Use descriptive, clear names
- Avoid abbreviations

### **Standard Fields**
```prisma
model YourFeature {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  user      User     @relation(fields: [userId], references: [id])
  userId    String
}
```

### **Enum Patterns**
```prisma
enum FeatureStatus {
  ACTIVE
  INACTIVE
  PENDING
  CANCELLED
}

enum FeatureType {
  BASIC
  PREMIUM
  ENTERPRISE
}
```

### **Relationship Patterns**
```prisma
// One-to-Many
model User {
  features Feature[]
}

model Feature {
  user   User   @relation(fields: [userId], references: [id])
  userId String
}

// Many-to-Many
model Feature {
  categories FeatureCategory[] @relation("FeatureToCategory")
}

model Category {
  features Feature[] @relation("FeatureToCategory")
}
```

---

## 🔌 **API Route Standards**

### **HTTP Methods**
- `GET`: Retrieve data
- `POST`: Create new resources
- `PUT`: Update entire resources
- `PATCH`: Partial updates
- `DELETE`: Remove resources

### **Response Format**
```typescript
// Success Response
{
  success: true,
  data: T,
  message?: string
}

// Error Response
{
  success: false,
  error: string,
  details?: any
}
```

### **Status Codes**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

### **Authentication Pattern**
```typescript
export async function POST(request: NextRequest) {
  // 1. Authentication check
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Input validation
  const body = await request.json()
  const validatedData = schema.parse(body)

  // 3. Business logic
  // ...

  // 4. Response
  return NextResponse.json({ success: true, data: result })
}
```

---

## 🧩 **Component Development**

### **Component Types**
1. **UI Components**: Reusable, generic components
2. **Feature Components**: Feature-specific components
3. **Layout Components**: Page structure components
4. **Form Components**: Input and form handling components

### **Props Interface Pattern**
```typescript
interface ComponentProps {
  // Required props
  title: string
  onAction: () => void
  
  // Optional props
  description?: string
  variant?: 'default' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  
  // Event handlers
  onClose?: () => void
  onChange?: (value: string) => void
  
  // Children
  children?: React.ReactNode
}
```

### **Styling Guidelines**
- Use Tailwind CSS classes
- Follow Shadcn UI patterns
- Use CSS variables for theming
- Implement responsive design
- Add dark mode support

### **Accessibility Requirements**
- Semantic HTML elements
- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- Focus management

---

## 🧪 **Testing Requirements**

### **Test Structure**
```
__tests__/
├── unit/                 # Unit tests
│   ├── components/      # Component tests
│   ├── services/        # Service tests
│   └── utils/           # Utility tests
├── integration/         # Integration tests
│   ├── api/            # API route tests
│   └── workflows/      # End-to-end tests
└── security/           # Security tests
    ├── auth.test.ts    # Authentication tests
    └── validation.test.ts # Input validation tests
```

### **Component Testing**
```typescript
// __tests__/unit/components/FeatureComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import FeatureComponent from '@/components/feature/FeatureComponent'

describe('FeatureComponent', () => {
  it('renders with required props', () => {
    render(<FeatureComponent title="Test Feature" />)
    expect(screen.getByText('Test Feature')).toBeInTheDocument()
  })

  it('calls onAction when button is clicked', () => {
    const mockAction = jest.fn()
    render(
      <FeatureComponent 
        title="Test Feature" 
        onAction={mockAction} 
      />
    )
    
    fireEvent.click(screen.getByRole('button'))
    expect(mockAction).toHaveBeenCalledTimes(1)
  })
})
```

### **API Testing**
```typescript
// __tests__/integration/api/feature.test.ts
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/feature/route'

describe('/api/feature', () => {
  it('creates feature with valid data', async () => {
    const request = new NextRequest('http://localhost:3000/api/feature', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Feature',
        description: 'Test Description',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.name).toBe('Test Feature')
  })
})
```

---

## 🔒 **Security Guidelines**

### **Input Validation**
- Use Zod schemas for all inputs
- Validate on both client and server
- Sanitize user-generated content
- Implement rate limiting

### **Authentication & Authorization**
- Check authentication on all protected routes
- Implement role-based access control
- Use Clerk for user management
- Validate user permissions

### **Data Protection**
- Use environment variables for secrets
- Implement proper error handling
- Log security events
- Use HTTPS in production

### **Security Testing**
```typescript
// __tests__/security/feature.test.ts
import { SecurityTestHelper } from './security-test-utils'

describe('Feature Security', () => {
  it('prevents XSS attacks', async () => {
    const xssPayload = '<script>alert("xss")</script>'
    const result = await SecurityTestHelper.testXSSProtection(
      '/api/feature',
      xssPayload
    )
    expect(result.isSecure).toBe(true)
  })
})
```

---

## 🚀 **Deployment Checklist**

### **Pre-Deployment**
- [ ] All tests passing
- [ ] Security tests passing
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Database migrations ready

### **Deployment Steps**
1. **Merge to main branch**
2. **Run production build**
3. **Deploy to staging**
4. **Run smoke tests**
5. **Deploy to production**
6. **Monitor for issues**

### **Post-Deployment**
- [ ] Monitor application logs
- [ ] Check error rates
- [ ] Verify feature functionality
- [ ] Update monitoring dashboards

---

## 🔧 **Troubleshooting**

### **Common Issues**

#### **Database Connection Issues**
```bash
# Check database connection
npx prisma db push

# Reset database
npx prisma migrate reset
```

#### **TypeScript Errors**
```bash
# Check TypeScript compilation
npx tsc --noEmit

# Generate Prisma types
npx prisma generate
```

#### **Test Failures**
```bash
# Run specific test
npm test -- --testNamePattern="FeatureComponent"

# Run with coverage
npm test -- --coverage
```

### **Debugging Tips**
1. **Use console.log strategically**
2. **Check browser developer tools**
3. **Review server logs**
4. **Use React Developer Tools**
5. **Check network requests**

---

## 📚 **Additional Resources**

### **Documentation**
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com)

### **Internal Documentation**
- [Security Guidelines](./security/README.md)
- [Performance Guidelines](./performance/README.md)
- [API Documentation](./api/README.md)

---

## 🎯 **Quick Reference**

### **Feature Development Checklist**
- [ ] Create feature branch
- [ ] Design database schema
- [ ] Create Prisma migration
- [ ] Implement API routes
- [ ] Create service layer
- [ ] Build React components
- [ ] Add form validation
- [ ] Write tests
- [ ] Update documentation
- [ ] Code review
- [ ] Deploy to staging
- [ ] Deploy to production

### **Code Quality Checklist**
- [ ] TypeScript types defined
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Accessibility features included
- [ ] Responsive design implemented
- [ ] Security measures in place
- [ ] Performance optimized
- [ ] Tests written and passing

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Maintainer**: Development Team

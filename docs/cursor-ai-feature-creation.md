# 🤖 Cursor AI Feature Creation Reference

**Purpose**: Quick reference guide for Cursor AI when creating new features  
**Usage**: Tag this document when requesting new feature development

---

## 🚀 **Quick Start Commands**

### **When User Requests New Feature:**
```
@cursor-ai-feature-creation.md
```

### **Standard Response Pattern:**
1. **Analyze Requirements** - Understand the feature request
2. **Plan Implementation** - Break down into steps
3. **Create TODO List** - Track progress
4. **Follow Standards** - Use established patterns
5. **Test & Validate** - Ensure quality

---

## 📋 **Feature Development Checklist**

### **Step 1: Planning**
- [ ] Understand feature requirements
- [ ] Identify affected components
- [ ] Plan database changes
- [ ] Consider security implications
- [ ] Estimate complexity

### **Step 2: Database**
- [ ] Update Prisma schema
- [ ] Create migration
- [ ] Update Prisma client
- [ ] Test database changes

### **Step 3: Backend**
- [ ] Create API routes
- [ ] Implement validation (Zod)
- [ ] Add authentication checks
- [ ] Create service layer
- [ ] Handle errors gracefully

### **Step 4: Frontend**
- [ ] Create React components
- [ ] Implement forms (React Hook Form)
- [ ] Add state management
- [ ] Include loading states
- [ ] Add error handling

### **Step 5: Testing**
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Test security measures
- [ ] Verify accessibility

### **Step 6: Documentation**
- [ ] Update component docs
- [ ] Add JSDoc comments
- [ ] Update README if needed

---

## 🏗️ **Code Templates**

### **API Route Template**
```typescript
// app/api/feature-name/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { z } from 'zod'
import { prisma } from '@/app/db'

const schema = z.object({
  // Define validation schema
})

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Validation
    const body = await request.json()
    const validatedData = schema.parse(body)

    // 3. Business logic
    const result = await prisma.feature.create({
      data: {
        ...validatedData,
        userId,
      },
    })

    // 4. Response
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Feature error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### **React Component Template**
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

### **Form Component Template**
```typescript
// components/forms/FeatureForm.tsx
'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface FeatureFormProps {
  onSubmit: (data: FormData) => void
  isLoading?: boolean
}

export default function FeatureForm({ onSubmit, isLoading }: FeatureFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </Form>
  )
}
```

---

## 🗄️ **Database Patterns**

### **Model Template**
```prisma
model FeatureName {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  user      User     @relation(fields: [userId], references: [id])
  userId    String
}
```

### **Migration Commands**
```bash
# Create migration
npx prisma migrate dev --name add-feature-name

# Generate client
npx prisma generate

# Push to database
npx prisma db push
```

---

## 🧪 **Testing Patterns**

### **Component Test Template**
```typescript
// __tests__/unit/components/FeatureComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import FeatureComponent from '@/components/feature/FeatureComponent'

describe('FeatureComponent', () => {
  it('renders correctly', () => {
    render(<FeatureComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

### **API Test Template**
```typescript
// __tests__/integration/api/feature.test.ts
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/feature/route'

describe('/api/feature', () => {
  it('handles valid request', async () => {
    const request = new NextRequest('http://localhost:3000/api/feature', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)
  })
})
```

---

## 🔒 **Security Checklist**

### **API Security**
- [ ] Authentication check (`await auth()`)
- [ ] Input validation (Zod schema)
- [ ] Error handling (try/catch)
- [ ] Rate limiting (if needed)
- [ ] CORS configuration

### **Frontend Security**
- [ ] Input sanitization
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Secure form handling

---

## 📁 **File Organization**

### **New Feature Structure**
```
feature-name/
├── components/
│   ├── FeatureComponent.tsx
│   └── FeatureForm.tsx
├── api/
│   └── route.ts
├── types/
│   └── feature.ts
└── __tests__/
    ├── unit/
    └── integration/
```

---

## 🎯 **Common Patterns**

### **Error Handling**
```typescript
try {
  // Operation
} catch (error) {
  console.error('Operation failed:', error)
  return NextResponse.json(
    { error: 'Operation failed' },
    { status: 500 }
  )
}
```

### **Loading States**
```typescript
const [isLoading, setIsLoading] = useState(false)

const handleSubmit = async (data: FormData) => {
  setIsLoading(true)
  try {
    await submitData(data)
  } finally {
    setIsLoading(false)
  }
}
```

### **Form Validation**
```typescript
const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password too short'),
})
```

---

## 🚀 **Deployment Steps**

### **Pre-Deployment**
1. Run tests: `npm test`
2. Check types: `npx tsc --noEmit`
3. Build project: `npm run build`
4. Review changes

### **Deployment**
1. Create PR
2. Code review
3. Merge to main
4. Deploy to staging
5. Deploy to production

---

## 📚 **Quick Commands**

```bash
# Create new component
touch components/feature/FeatureComponent.tsx

# Create API route
mkdir -p app/api/feature-name
touch app/api/feature-name/route.ts

# Create test file
touch __tests__/unit/components/FeatureComponent.test.tsx

# Run tests
npm test

# Check types
npx tsc --noEmit

# Database migration
npx prisma migrate dev --name add-feature
```

---

**Remember**: Always follow the established patterns, include proper error handling, and write tests for new features!

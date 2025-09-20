# FonoSaaS Cursor Templates

## 🏗️ Component Templates

### React Component (Client)
```typescript
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ComponentNameProps {
  // Define props with proper types
  className?: string;
}

export function ComponentName({ className, ...props }: ComponentNameProps) {
  const [state, setState] = useState<unknown>(null);

  return (
    <div className={cn('default-classes', className)} {...props}>
      {/* Component content */}
    </div>
  );
}
```

### React Component (Server)
```typescript
import { cn } from '@/lib/utils';

interface ComponentNameProps {
  // Define props with proper types
  className?: string;
}

export function ComponentName({ className, ...props }: ComponentNameProps) {
  return (
    <div className={cn('default-classes', className)} {...props}>
      {/* Component content */}
    </div>
  );
}
```

### API Route Template
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateInput } from '@/lib/security/validation';

const schema = z.object({
  // Define input schema
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = validateInput(schema, body);
    
    // Implementation here
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

### Database Model Template
```typescript
// In prisma/schema.prisma
model ModelName {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Add fields here
  
  @@map("model_name")
}
```

## 🧪 Test Templates

### Unit Test Template
```typescript
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

### Integration Test Template
```typescript
import { test, expect } from '@playwright/test';

test('feature integration test', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Test implementation
  
  await expect(page.locator('h1')).toContainText('Expected Text');
});
```

## 🔒 Security Templates

### Input Validation
```typescript
import { z } from 'zod';

export const inputSchema = z.object({
  field: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/), // Brazilian format
});

export type InputType = z.infer<typeof inputSchema>;
```

### LGPD Compliance Check
```typescript
// Always include in forms that collect personal data
const lgpdCompliance = {
  consentRequired: true,
  dataRetention: '2 years',
  purpose: 'Healthcare service provision',
  contact: 'dpo@almanaquedafala.com.br'
};
```

## 🌐 Brazilian Market Templates

### Date Formatting
```typescript
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatBrazilianDate = (date: Date) => {
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
};
```

### Currency Formatting
```typescript
export const formatBrazilianCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};
```

### Phone Formatting
```typescript
export const formatBrazilianPhone = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
};
```

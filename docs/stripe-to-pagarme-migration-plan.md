# Migration Plan: Stripe to Pagar.me

## Overview
This document outlines the complete migration from Stripe to Pagar.me for the FonoSaaS platform, taking advantage of Brazilian payment methods and compliance requirements.

## Current Stripe Integration Analysis

### Current Components
- ✅ Stripe Service (`services/stripeService.ts`)
- ✅ API Routes: `/api/stripe/create-checkout`, `/api/stripe/create-portal`, `/api/create-checkout`
- ✅ Webhook Handler: `/api/webhooks/stripe/route.ts`
- ✅ Billing Portal: `/api/billing/portal/route.ts`
- ✅ Frontend Components: `SubscribeButton`, `SubscriptionPlans`, `SubscriptionStatus`
- ✅ Database: `Subscription` model with Stripe-specific fields

### Current Pricing Structure
- **Monthly Plan**: R$ 39.90/month
- **Currency**: BRL (Brazilian Real)
- **Payment Methods**: Credit cards only
- **Billing**: Recurring subscriptions

## Phase 1: Setup & Configuration (Week 1)

### 1.1 Pagar.me Account Setup
- [ ] Create Pagar.me account and get API credentials
- [ ] Configure webhook endpoints
- [ ] Set up PIX, Boleto, and card payment methods
- [ ] Configure installment plans (parcelamento)
- [ ] Set up sandbox environment for testing

### 1.2 Environment Configuration
```bash
# Add to .env.local
PAGARME_API_KEY=your_api_key
PAGARME_WEBHOOK_SECRET=your_webhook_secret
PAGARME_ENCRYPTION_KEY=your_encryption_key
PAGARME_ENVIRONMENT=sandbox # or production
PAGARME_PUBLIC_KEY=your_public_key
```

### 1.3 Install Pagar.me Dependencies
```bash
npm install pagarme
npm install @types/pagarme --save-dev
```

### 1.4 Database Schema Updates
```sql
-- Add Pagar.me specific fields to Subscription model
ALTER TABLE "Subscription" ADD COLUMN "pagarmeSubscriptionId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "pagarmeCustomerId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "paymentMethod" TEXT; -- 'card', 'pix', 'boleto'
ALTER TABLE "Subscription" ADD COLUMN "installmentPlan" INTEGER; -- for parcelamento
ALTER TABLE "Subscription" ADD COLUMN "boletoUrl" TEXT; -- for boleto payments
ALTER TABLE "Subscription" ADD COLUMN "pixCode" TEXT; -- for PIX payments
ALTER TABLE "Subscription" ADD COLUMN "pixExpiration" TIMESTAMP; -- PIX expiration
```

## Phase 2: Service Layer Migration (Week 1-2)

### 2.1 Create Pagar.me Service
```typescript
// services/pagarmeService.ts
import pagarme from 'pagarme';

export class PagarMeService {
  private static client: any;

  static async initialize() {
    this.client = await pagarme.client.connect({
      encryption_key: process.env.PAGARME_ENCRYPTION_KEY
    });
  }

  static async createCustomer(userData: {
    name: string;
    email: string;
    document_number: string;
    phone: string;
    address: any;
  }) {
    return await this.client.customers.create(userData);
  }

  static async createSubscription(customerId: string, planId: string, paymentMethod: string) {
    // Implementation for subscription creation
  }
  
  static async createPixPayment(amount: number, customer: any) {
    const transaction = await this.client.transactions.create({
      amount: amount,
      payment_method: 'pix',
      customer: customer,
      metadata: {
        product: 'FonoSaaS Pro'
      }
    });
    return transaction;
  }
  
  static async createBoletoPayment(amount: number, customer: any) {
    const transaction = await this.client.transactions.create({
      amount: amount,
      payment_method: 'boleto',
      customer: customer,
      boleto_expiration_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days
      metadata: {
        product: 'FonoSaaS Pro'
      }
    });
    return transaction;
  }
  
  static async createCardPayment(amount: number, cardData: any, customer: any, installments: number = 1) {
    const transaction = await this.client.transactions.create({
      amount: amount,
      payment_method: 'credit_card',
      installments: installments,
      card_number: cardData.number,
      card_cvv: cardData.cvv,
      card_expiration_date: cardData.expiration_date,
      card_holder_name: cardData.holder_name,
      customer: customer,
      metadata: {
        product: 'FonoSaaS Pro'
      }
    });
    return transaction;
  }
  
  static async handleWebhook(body: any, signature: string) {
    return await this.client.transactions.find({
      id: body.id
    });
  }

  static async getTransaction(transactionId: string) {
    return await this.client.transactions.find({
      id: transactionId
    });
  }

  static async cancelSubscription(subscriptionId: string) {
    return await this.client.subscriptions.cancel({
      id: subscriptionId
    });
  }
}
```

### 2.2 Update Prisma Schema
```prisma
model Subscription {
  id                 String    @id @default(cuid())
  userId             String    @unique
  tier               TierType  @default(FREE)
  status             SubStatus @default(INACTIVE)
  currentPeriodStart DateTime  @default(now())
  currentPeriodEnd   DateTime?
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
  
  // Stripe fields (to be deprecated)
  paymentId          String?
  
  // Pagar.me fields
  pagarmeSubscriptionId String?
  pagarmeCustomerId     String?
  paymentMethod         String? // 'card', 'pix', 'boleto'
  installmentPlan       Int?    // for parcelamento
  boletoUrl             String? // for boleto payments
  pixCode               String? // for PIX payments
  pixExpiration         DateTime? // PIX expiration
  
  user               User      @relation(fields: [userId], references: [id])

  @@index([status, currentPeriodEnd])
  @@index([tier])
  @@index([createdAt])
  @@index([pagarmeCustomerId])
}
```

## Phase 3: API Routes Migration (Week 2)

### 3.1 Create Pagar.me API Routes

#### `/api/pagarme/create-subscription/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PagarMeService } from '@/services/pagarmeService';
import { prisma } from '@/app/db';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentMethod, installmentPlan = 1 } = await req.json();
    
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create customer in Pagar.me
    const customer = await PagarMeService.createCustomer({
      name: user.fullName,
      email: user.email,
      document_number: user.cpf || '00000000000', // Add CPF to user model
      phone: user.phone || '11999999999',
      address: {
        street: 'Rua Exemplo',
        street_number: '123',
        neighborhood: 'Centro',
        zipcode: '01234567',
        city: 'São Paulo',
        state: 'SP',
        country: 'BR'
      }
    });

    // Create subscription based on payment method
    let subscription;
    const amount = 3990; // R$ 39.90 in centavos

    switch (paymentMethod) {
      case 'pix':
        subscription = await PagarMeService.createPixPayment(amount, customer);
        break;
      case 'boleto':
        subscription = await PagarMeService.createBoletoPayment(amount, customer);
        break;
      case 'card':
        // Card data should come from frontend
        const cardData = await req.json();
        subscription = await PagarMeService.createCardPayment(amount, cardData, customer, installmentPlan);
        break;
      default:
        return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }

    // Update database
    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        pagarmeCustomerId: customer.id,
        paymentMethod,
        installmentPlan,
        status: 'PENDING',
        boletoUrl: subscription.boleto_url,
        pixCode: subscription.pix_code,
        pixExpiration: subscription.pix_expiration_date ? new Date(subscription.pix_expiration_date) : null
      },
      create: {
        userId: user.id,
        tier: 'PRO',
        status: 'PENDING',
        pagarmeCustomerId: customer.id,
        paymentMethod,
        installmentPlan,
        boletoUrl: subscription.boleto_url,
        pixCode: subscription.pix_code,
        pixExpiration: subscription.pix_expiration_date ? new Date(subscription.pix_expiration_date) : null
      }
    });

    return NextResponse.json({
      success: true,
      transaction: subscription,
      paymentMethod
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Error creating subscription' },
      { status: 500 }
    );
  }
}
```

#### `/api/pagarme/webhook/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PagarMeService } from '@/services/pagarmeService';
import { prisma } from '@/app/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const signature = req.headers.get('x-pagarme-signature') || '';

    // Verify webhook signature
    const transaction = await PagarMeService.getTransaction(body.id);
    
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Find user by customer ID
    const subscription = await prisma.subscription.findFirst({
      where: { pagarmeCustomerId: transaction.customer.id },
      include: { user: true }
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Handle different transaction statuses
    switch (transaction.status) {
      case 'paid':
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'ACTIVE',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
          }
        });
        break;
        
      case 'refused':
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'FAILED' }
        });
        break;
        
      case 'pending':
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'PENDING' }
        });
        break;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
```

### 3.2 Additional API Routes
- [ ] `/api/pagarme/payment-methods` - Get available payment methods
- [ ] `/api/pagarme/installment-options` - Get installment options for cards
- [ ] `/api/pagarme/transaction-status` - Check transaction status
- [ ] `/api/pagarme/cancel-subscription` - Cancel subscription

## Phase 4: Frontend Migration (Week 2-3)

### 4.1 Update Payment Components

#### Enhanced SubscribeButton Component
```typescript
// components/SubscribeButton.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SubscribeButtonProps {
  className?: string;
  priceId?: string;
}

export function SubscribeButton({ className, priceId }: SubscribeButtonProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [installments, setInstallments] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/pagarme/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod,
          installmentPlan: installments
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Handle different payment methods
        if (paymentMethod === 'pix') {
          // Show PIX QR code
          window.open(data.transaction.pix_qr_code, '_blank');
        } else if (paymentMethod === 'boleto') {
          // Show Boleto PDF
          window.open(data.transaction.boleto_url, '_blank');
        } else if (paymentMethod === 'card') {
          // Redirect to card payment form
          // Implementation depends on your card form
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Escolha sua forma de pagamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="payment-method">Método de Pagamento</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pix">PIX (Instantâneo)</SelectItem>
              <SelectItem value="boleto">Boleto Bancário</SelectItem>
              <SelectItem value="card">Cartão de Crédito</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {paymentMethod === 'card' && (
          <div>
            <Label htmlFor="installments">Parcelas</Label>
            <Select value={installments.toString()} onValueChange={(value) => setInstallments(Number(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1x de R$ 39,90</SelectItem>
                <SelectItem value="2">2x de R$ 19,95</SelectItem>
                <SelectItem value="3">3x de R$ 13,30</SelectItem>
                <SelectItem value="6">6x de R$ 6,65</SelectItem>
                <SelectItem value="12">12x de R$ 3,33</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <Button 
          onClick={handlePayment} 
          disabled={!paymentMethod || isLoading}
          className="w-full"
        >
          {isLoading ? 'Processando...' : 'Assinar Pro'}
        </Button>
      </CardContent>
    </Card>
  );
}
```

### 4.2 Brazilian UX Components

#### PIX Payment Component
```typescript
// components/payments/PixPayment.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PixPaymentProps {
  pixCode: string;
  pixExpiration: string;
  onPaymentConfirmed: () => void;
}

export function PixPayment({ pixCode, pixExpiration, onPaymentConfirmed }: PixPaymentProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const expiration = new Date(pixExpiration).getTime();
    const now = new Date().getTime();
    const difference = expiration - now;
    
    if (difference > 0) {
      setTimeLeft(Math.floor(difference / 1000));
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [pixExpiration]);

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagamento via PIX</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Código PIX (Copie e cole no seu app de pagamento)</Label>
          <div className="flex gap-2">
            <Input value={pixCode} readOnly className="font-mono" />
            <Button onClick={copyPixCode}>Copiar</Button>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Tempo restante: {formatTime(timeLeft)}
          </p>
        </div>

        <div className="text-center">
          <Button onClick={onPaymentConfirmed} className="w-full">
            Já paguei via PIX
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### Boleto Payment Component
```typescript
// components/payments/BoletoPayment.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BoletoPaymentProps {
  boletoUrl: string;
  onPaymentConfirmed: () => void;
}

export function BoletoPayment({ boletoUrl, onPaymentConfirmed }: BoletoPaymentProps) {
  const openBoleto = () => {
    window.open(boletoUrl, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagamento via Boleto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Clique no botão abaixo para gerar e imprimir seu boleto bancário.
          O pagamento será processado em até 3 dias úteis.
        </p>
        
        <Button onClick={openBoleto} className="w-full">
          Gerar Boleto
        </Button>

        <Button 
          onClick={onPaymentConfirmed} 
          variant="outline" 
          className="w-full"
        >
          Já paguei o boleto
        </Button>
      </CardContent>
    </Card>
  );
}
```

## Phase 5: Testing & Validation (Week 3)

### 5.1 Test Scenarios
- [ ] PIX payment flow (QR code generation, payment confirmation)
- [ ] Boleto payment flow (PDF generation, payment tracking)
- [ ] Card payment with installments (1x, 2x, 3x, 6x, 12x)
- [ ] Webhook event handling (paid, refused, pending)
- [ ] Subscription management (cancel, renew)
- [ ] Refund/cancellation flows
- [ ] CPF/CNPJ validation
- [ ] Brazilian address validation

### 5.2 Data Migration
- [ ] Migrate existing Stripe subscriptions (if any)
- [ ] Update user payment preferences
- [ ] Test with Pagar.me sandbox environment
- [ ] Validate all payment methods work correctly

## Phase 6: Deployment & Monitoring (Week 4)

### 6.1 Production Deployment
- [ ] Deploy to production with feature flags
- [ ] Gradual rollout to users
- [ ] Monitor payment success rates
- [ ] Set up alerts for failed payments
- [ ] Monitor webhook delivery

### 6.2 Cleanup
- [ ] Remove Stripe dependencies
- [ ] Archive old Stripe code
- [ ] Update documentation
- [ ] Remove Stripe environment variables

## Key Differences: Stripe vs Pagar.me

| Feature | Stripe | Pagar.me |
|---------|--------|----------|
| **Currency** | Multi-currency | BRL only |
| **Payment Methods** | Cards, ACH, etc. | Cards, PIX, Boleto |
| **Installments** | Limited | Native support (1-12x) |
| **Compliance** | International | Brazilian (LGPD, etc.) |
| **Pricing** | 2.9% + 30¢ | 2.99% + R$0.39 |
| **Webhooks** | JSON events | JSON events |
| **Customer Portal** | Built-in | Custom implementation |
| **PIX Support** | No | Yes (instant) |
| **Boleto Support** | No | Yes (3-day processing) |

## Brazilian-Specific Features

### 1. PIX Integration
- QR Code generation
- Instant payment confirmation
- Pix key validation
- Expiration time management

### 2. Boleto Integration
- PDF generation
- Due date management (3 days)
- Payment confirmation tracking
- Bank processing delays

### 3. Installment Plans (Parcelamento)
- 1x, 2x, 3x, 6x, 12x options
- Interest rate calculation
- Brazilian credit card validation
- Minimum installment amounts

### 4. Compliance Features
- CPF/CNPJ validation
- Brazilian address validation
- LGPD compliance
- Tax calculation (if applicable)

## Risk Mitigation

### 1. Gradual Migration
- Use feature flags to enable Pagar.me for new users
- Keep Stripe running for existing users
- Migrate users in batches
- A/B testing for payment methods

### 2. Fallback Strategy
- Maintain Stripe integration as backup
- Quick rollback capability
- Monitor payment success rates
- Alert system for payment failures

### 3. Testing Strategy
- Comprehensive sandbox testing
- Load testing with Brazilian payment methods
- User acceptance testing
- Payment method conversion testing

## Timeline Summary

- **Week 1**: Setup, configuration, service layer, database updates
- **Week 2**: API routes, webhooks, frontend components
- **Week 3**: Testing, validation, bug fixes
- **Week 4**: Deployment, monitoring, cleanup

## Estimated Effort
- **Development**: 3-4 weeks
- **Testing**: 1 week
- **Deployment**: 1 week
- **Total**: 5-6 weeks

## Success Metrics
- Payment success rate > 95%
- PIX adoption rate > 60%
- Average payment processing time < 30 seconds
- User satisfaction score > 4.5/5
- Reduced payment abandonment rate

## Next Steps
1. Create Pagar.me account and get API credentials
2. Set up sandbox environment
3. Begin Phase 1 implementation
4. Schedule weekly progress reviews
5. Prepare user communication plan

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Author**: Development Team  
**Status**: Planning Phase

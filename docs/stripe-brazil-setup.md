# Stripe setup: Brazilian account

Account: `acct_1UdEl0PAgzz7aAo8` (country BR, currency BRL).
The account switcher (top left of the Dashboard) shows test or live mode.
Steps 1-3 are one-time account setup. Steps 4-7 must be done in **live mode**
too: test-mode objects do not carry over.

Never paste secret keys (`sk_…`, `whsec_…`) into chats, tickets or commits.

## 1. Activate the account

Dashboard banner "Activate payments" / "Complete your profile".

- [ ] Business type: company (LTDA)
- [ ] Company: TALK FONOAUDIOLOGIA LTDA, CNPJ 35.562.629/0001-00, address, website
- [ ] Legal representative: name, CPF, date of birth, address (Stripe may ask for an ID document)
- [ ] Payouts: Brazilian bank account in the company's name
- [ ] Business description (as submitted):
  > O Almanaque da Fala é uma biblioteca por assinatura de atividades
  > imprimíveis de fonoaudiologia, para fonoaudiólogos, professores e
  > famílias. As atividades são organizadas por fonema e faixa etária e
  > entregues em PDF e imagem pelo nosso site. Cobramos uma assinatura mensal
  > ou anual, e há algumas amostras gratuitas, sem pagamento.

Do not describe the business as healthcare or medical: it sells activity
material only and stores no patient data.

## 2. Public details

Settings → Business → Public details, and Settings → Branding.

- [ ] Business name: `Almanaque da Fala`
- [ ] Statement descriptor: `ALMANAQUE DA FALA`; short descriptor: `ALMANAQUE`
- [ ] Support email: `contato@almanaquedafala.com.br`
- [ ] Support URL, privacy policy (`/privacidade`) and terms (`/termos`) URLs
- [ ] Logo and brand color (shown on Checkout and receipts)

## 3. Security

Settings → Team and security; Developers → API keys.

- [ ] Two-step verification for every Dashboard user
- [ ] Roll the **test** secret key (it was shared in a chat) and update
      `.env.local`
- [ ] Separately: roll the old Irish account's key (`sk_test_51Pi…`); it is in
      the public repo's git history

## 4. Payment methods

Settings → Payment methods.

- [ ] Card: on
- [ ] Pix: on (in live mode, check it shows as active after activation)

Pix subscriptions use Pix Automático: the customer authorizes a mandate in
their bank app once; renewals are charged automatically. The app sets the
mandate amount and schedule from the price.

## 5. Products (live mode)

Product catalog.

- [ ] Product "Almanaque da Fala Profissional"
- [ ] Recurring price, **BRL**, R$ 39,90 monthly
- [ ] Recurring price, **BRL**, R$ 299,00 yearly (37% off 12 × R$ 39,90;
      the site states this discount, computed in `lib/pricing.ts`)
- [ ] Copy both `price_…` IDs (step 9)

Prices must stay in sync with `lib/pricing.ts` (what the site shows). The app
refuses non-BRL prices at checkout.

Test mode (already created): product `prod_Veb0eQZVHKP25r`, monthly
`price_1UdHoePAgzz7aAo8syA1RgiP`, yearly `price_1UdHofPAgzz7aAo8ncadcz6e`.

## 6. Customer portal (live mode)

Settings → Billing → Customer portal.

- [ ] Cancellation at the end of the billing period
- [ ] Plan switching between the monthly and yearly prices
- [ ] Payment method updates and invoice history
- [ ] Terms and privacy links

## 7. Webhook endpoint (live mode)

Developers / Workbench → Webhooks → Add endpoint.

- [ ] URL: `https://www.almanaquedafala.com.br/api/webhooks/stripe`
- [ ] Events:
  - `checkout.session.completed`
  - `checkout.session.async_payment_succeeded`
  - `checkout.session.async_payment_failed`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- [ ] Copy the signing secret `whsec_…` (step 9)

The webhook is idempotent (duplicate deliveries are ignored), so replaying
events from the Dashboard is safe.

## 8. Billing settings

Settings → Billing.

- [ ] Failed payments: Smart Retries on; after the final retry, cancel the
      subscription (matches the app)
- [ ] Customer emails: receipts and failed-payment emails on. The app already
      sends its own confirmation and cancellation emails; avoid duplicates.

## 9. Vercel environment variables (Production only)

- [ ] `STRIPE_SECRET_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_MONTHLY_PRICE_ID`
- [ ] `STRIPE_ANNUAL_PRICE_ID`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] Redeploy

Preview shares the production database, so do not point Preview at live keys.

## 10. Check after going live

- [ ] One real low-value payment by card and one by Pix, then refund them
- [ ] Send a test event from the webhook page; the app must answer 200
- [ ] Customer portal opens from Perfil → Assinatura

## Nota fiscal (Brazil)

Stripe sends receipts and invoices but does **not** issue the nota fiscal
(NFS-e). You will likely need to issue one per payment through the city's
system or a provider. Ask your accountant how to handle it for a digital
subscription sold by an LTDA.

## Local development

Two terminals in this worktree (`.env.local` holds the test Stripe values):

```
stripe listen --forward-to localhost:3000/api/webhooks/stripe --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed,invoice.payment_succeeded,invoice.payment_failed,customer.subscription.updated,customer.subscription.deleted
yarn dev
```

Use Stripe CLI 1.55+ (the newer CLI requires `--events`). The webhook secret
printed by `stripe listen` goes in `STRIPE_WEBHOOK_SECRET` in `.env.local`.

Test payments: card `4242 4242 4242 4242`, any future date and CVC. Pix:
choose Pix, CPF `000.000.000-00`, "Reveal QR Code", then "Simulate scan".

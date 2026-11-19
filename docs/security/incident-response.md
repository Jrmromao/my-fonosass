# Incident response plan

Draft for the owner to review and fill in. Written for a small team where the
owner is also the data protection officer (DPO). Keep it short enough to be
read during an incident.

**Legal clock (LGPD, Resolução CD/ANPD nº 15/2024):** if an incident involving
personal data may cause relevant risk or harm to people, the ANPD and the
affected people must be told within **3 business days** of learning that the
incident affected personal data (not from the date of the attack). Notification
to the ANPD is made by the DPO through the ANPD's electronic system (SEI).
Verify the current wording with your lawyer; this is a summary, not legal advice.

## Who does what

| Role | Person | Contact |
|---|---|---|
| Incident lead (decides, owns the clock) | _fill in_ | _fill in_ |
| DPO (ANPD and user notices) | _fill in_ | dpo@almanaquedafala.com.br |
| Technical responder | _fill in_ | _fill in_ |
| Lawyer / outside counsel | _fill in_ | _fill in_ |

## 1. Detect (what tells us something is wrong)

- Admin audit trail: `/dashboard/auditoria`, filter "Eventos de segurança"
  (`security.admin_denied`, `security.approval_token_invalid`,
  `security.csp_violation`).
- Clerk dashboard (unusual sign-ins), Stripe dashboard (disputes, odd
  subscriptions), Vercel runtime logs (spikes of 4xx/5xx), Upstash usage.
- A user, researcher or vendor writing to dpo@ or the address in
  `/.well-known/security.txt`.

Write down **the time you first learned of it**. The 3-day clock starts when
you know personal data was affected.

## 2. Contain (first hour)

Do the smallest thing that stops the damage; do not delete evidence.

| Situation | Action |
|---|---|
| Admin account suspected | Clerk: revoke sessions, reset the account; set `role` back to `USER` in the database if needed |
| API key or secret exposed | Rotate it at the provider (Clerk, Stripe, AWS, OpenAI, Resend, Upstash, `ADMIN_API_KEY`), update Vercel env vars, redeploy |
| Bad deploy | Vercel: promote the previous deployment |
| Abuse of one endpoint | Block the IP range in Vercel Firewall; lower the limit in `lib/security/rateLimiter.ts` |
| Database exposure | Rotate the DB password, restrict network access, take a snapshot **before** changing anything |

## 3. Assess (same day)

Answer in writing, with timestamps:

1. What happened, and how did we find out?
2. Which data and how many people (accounts, emails, IPs, subscription status)?
   The app stores no patient data and no card numbers (Stripe holds those).
3. Was the data readable by the attacker (not encrypted, or keys also lost)?
4. Is the risk to people **relevant** (identity theft, fraud, discrimination,
   exposure of children's data)? If unsure, treat it as relevant.
5. Is it still ongoing?

Use the audit trail and Vercel/Clerk/Stripe logs as evidence. Export them
before the retention window (audit events live 6 months).

## 4. Notify (within 3 business days if risk is relevant)

- **ANPD:** DPO files the communication (what happened, data and people
  affected, risks, measures taken, contact). Partial information is allowed
  with a promise to complete it.
- **Affected people:** plain-language email: what happened, what data, what
  they should do, what we did, how to reach the DPO. Send from the DPO address.
- **Processors:** tell the provider involved (Clerk, Stripe, Vercel, AWS) and
  follow their process.
- **Keep a record** of every incident, even those not notified (what, when,
  decision and reason). The ANPD may ask for it.

## 5. Recover and learn (within 2 weeks)

- Restore service (see `backup-restore-runbook.md`), confirm the cause is closed.
- Write a short post-incident note: timeline, root cause, what worked, what
  to change. Open tasks for each change.
- Update this plan if a step was missing or wrong.

## Practice

Once a year (or after big changes), run a 30-minute tabletop: pick a scenario
("admin account taken over", "S3 keys leaked") and walk through sections 1-4
with the real contacts. Check the contact table is current.

# Processors and recipients (draft)

Built from what the code uses. For the owner/DPO to confirm, complete and keep
current. LGPD art. 37 asks the controller to keep a record of processing; this
is a starting point, not a finished record. "Contract" = data processing terms
accepted with the provider (check each).

| Provider | What for | Personal data it receives | Region / transfer | Contract |
|---|---|---|---|---|
| Clerk | Sign-in, sessions | Name, email, password (held by Clerk), login metadata | US (verify) - international transfer | _check DPA_ |
| Stripe | Subscriptions and payments | Email, name, card data (held by Stripe, never by us), billing events | US/EU (verify) | _check DPA_ |
| Vercel | Hosting, CDN, analytics | IP, request logs, page views (Vercel Analytics/Speed Insights) | Functions in `dub1` (Ireland); CDN global | _check DPA_ |
| Database host | PostgreSQL | All account data | _fill in_ | _check_ |
| AWS S3 | Activity files, waiting-list entries, blog images | Waiting-list emails and IPs (JSON files); no account data | `AWS_REGION` (eu-west-1 default) | _check_ |
| Resend | Email delivery | Recipient email and name, message content | US (verify) | _check DPA_ |
| Upstash Redis | Rate-limit counters | IP addresses (short-lived keys) | _fill in region_ | _check_ |
| Google Analytics | Usage analytics | Only after the visitor accepts (consent banner) | US | consent |
| OpenAI | Generating activity content (admin tools and the subscriber activity generator) | Topic, phoneme and age range typed in the form; **no account or patient data** by design | US | _check_ |
| Google Cloud TTS | Text-to-speech (admin tool) | Text typed by admins; no user data | US | _check_ |
| Telegram | Reviewer notifications for new activities | Activity names and review links; no user data | Telegram servers | _n/a, internal_ |
| Cloudflare Turnstile (via Clerk) | Bot protection at sign-up | Browser signals | Global | via Clerk |

## Open points

- International transfers (Clerk, Stripe, Resend, Google, OpenAI): LGPD arts.
  33-36 require a legal mechanism (standard clauses or adequacy). Confirm what
  each provider's terms cover.
- The privacy policy section 4 ("com quem compartilhamos") must list every
  provider that receives personal data. Compare it with this table whenever
  either changes.
- OpenAI and Google tools must never be fed account data or anything about a patient or child.

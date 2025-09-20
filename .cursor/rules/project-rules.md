# FonoSaaS Cursor Rules

## 🧠 KNOWLEDGE BASE
Before making any changes, ALWAYS read the complete knowledge base:
- Start with: `docs/knowledge-base/index.md`
- Read: `docs/knowledge-base/SUMMARY.md` for complete overview
- Check: `docs/knowledge-base/cursor-quick-reference.md` for daily work
- Review: `docs/knowledge-base/mistakes-and-solutions.md` to avoid past errors

## 🚨 CRITICAL RULES - NEVER BREAK THESE

### Security & LGPD (MOST IMPORTANT):
- ❌ NEVER hardcode passwords, emails, or personal data
- ❌ NEVER remove LGPD compliance features
- ❌ NEVER skip input validation
- ❌ NEVER remove authentication checks
- ✅ ALWAYS use environment variables for sensitive data
- ✅ ALWAYS validate inputs with Zod schemas
- ✅ ALWAYS maintain Portuguese language support

### Technical Rules:
- ❌ NEVER use `any` type in TypeScript
- ❌ NEVER call server actions from client components
- ❌ NEVER upgrade to Tailwind CSS v4
- ✅ ALWAYS use `unknown` type with type guards
- ✅ ALWAYS use API routes for client-side data fetching
- ✅ ALWAYS stay with Tailwind CSS v3

## 🏗️ PROJECT CONTEXT
- **Name**: FonoSaaS (Almanaque da Fala)
- **Domain**: almanaquedafala.com.br
- **Purpose**: SaaS for Brazilian fonoaudiologists
- **Status**: Production Ready
- **Compliance**: LGPD Compliant
- **Language**: Portuguese (Brazil)

## 🔒 SECURITY REQUIREMENTS
- LGPD compliance is MANDATORY
- All personal data must be protected
- Consent management required
- Input validation with Zod schemas
- Authentication on all API routes
- No hardcoded credentials

## 🛠️ TECH STACK
- Next.js 15.5.3 (App Router)
- TypeScript (strict mode)
- Tailwind CSS v3 (NOT v4)
- Prisma + PostgreSQL
- Clerk authentication
- Stripe payments
- AWS S3 storage

## 📁 FILE STRUCTURE
- `/app/api` - API routes (server-side only)
- `/app/dashboard` - Dashboard pages
- `/app/privacidade` - Privacy policy (LGPD)
- `/app/termos` - Terms of service
- `/app/cookies` - Cookie policy
- `/app/lgpd` - LGPD information
- `/app/dpo` - DPO contact page
- `/components/legal` - Legal compliance components

## 🧪 TESTING COMMANDS
```bash
yarn test               # Run all tests
yarn test:security      # Run security tests
yarn lint               # Run ESLint
yarn lint:fix           # Fix ESLint issues
yarn type-check         # TypeScript checking
yarn build              # Build for production
```

## 🚫 COMMON ANTI-PATTERNS TO AVOID
- Server actions in client components
- Hardcoded values
- Missing input validation
- Using `any` type in TypeScript
- Upgrading to Tailwind CSS v4

## 📚 BEFORE MAKING CHANGES
1. Read the knowledge base documentation
2. Check similar implementations in the codebase
3. Follow the established patterns
4. Test your changes with `yarn build`
5. Ensure LGPD compliance is maintained

## 🆘 WHEN IN DOUBT
- Check the knowledge base first
- Look at similar code in the project
- Ask for clarification rather than guessing
- Prioritize security and LGPD compliance

## 🤖 CURSOR AI ENHANCEMENT RULES

### When AI Suggests Code:
1. **Always validate** against our knowledge base
2. **Check security implications** before accepting
3. **Verify LGPD compliance** for any data handling
4. **Test with our commands** before committing
5. **Follow our established patterns** exactly

### AI Code Review Checklist:
- [ ] TypeScript strict mode compliant
- [ ] No `any` types used
- [ ] Input validation with Zod
- [ ] Portuguese language support
- [ ] LGPD compliance maintained
- [ ] Security best practices followed
- [ ] Brazilian market requirements met
- [ ] Tests included for new features

### AI Prompting Best Practices:
- Always mention "FonoSaaS" and "LGPD compliance"
- Reference specific knowledge base sections
- Ask for Brazilian market considerations
- Request security review for sensitive features
- Specify TypeScript strict mode requirements

### Code Generation Guidelines:
- Use our established component patterns
- Include proper error handling
- Add comprehensive TypeScript types
- Implement Brazilian formatting (dates, currency, phone)
- Include LGPD compliance considerations
- Follow our security validation patterns

Remember: This is a Brazilian healthcare SaaS application with strict LGPD compliance requirements. Always prioritize security, data protection, and user experience!

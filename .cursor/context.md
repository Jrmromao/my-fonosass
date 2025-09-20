# FonoSaaS Context for Cursor

## Project Overview
- **Name**: FonoSaaS (Almanaque da Fala)
- **Domain**: almanaquedafala.com.br
- **Purpose**: Brazilian healthcare SaaS for fonoaudiologists
- **Status**: Production Ready
- **Compliance**: LGPD Compliant

## Critical Knowledge Base
- **Main Entry**: `docs/knowledge-base/index.md`
- **Quick Reference**: `docs/knowledge-base/cursor-quick-reference.md`
- **Complete Summary**: `docs/knowledge-base/SUMMARY.md`
- **Development Guidelines**: `docs/knowledge-base/development-guidelines.md`
- **Mistakes & Solutions**: `docs/knowledge-base/mistakes-and-solutions.md`

## Tech Stack
- Next.js 15.5.3 (App Router)
- TypeScript (strict mode)
- Tailwind CSS v3 (NOT v4)
- Prisma + PostgreSQL
- Clerk authentication
- Stripe payments
- AWS S3 storage

## Critical Rules
- NEVER hardcode credentials or personal data
- NEVER remove LGPD compliance features
- NEVER use `any` type in TypeScript
- NEVER call server actions from client components
- NEVER upgrade to Tailwind CSS v4
- ALWAYS use environment variables for sensitive data
- ALWAYS validate inputs with Zod schemas
- ALWAYS maintain Portuguese language support

## Key Files
- `app/layout.tsx` - Root layout with ConsentManager
- `components/legal/ConsentManager.tsx` - Cookie consent management
- `middleware.ts` - Authentication and rate limiting
- `next.config.ts` - Security headers and configuration
- `lib/security/validation.ts` - Input validation utilities

## Testing Commands
- `yarn test` - Run all tests
- `yarn test:security` - Run security tests
- `yarn lint` - Run ESLint
- `yarn type-check` - TypeScript checking
- `yarn build` - Production build

## Package Manager
- **ALWAYS use `yarn`** - Never use `npm` commands
- All package management operations must use yarn
- Install dependencies: `yarn add <package>`
- Remove dependencies: `yarn remove <package>`
- Run scripts: `yarn <script-name>`

## Prisma Schema Changes Workflow
**CRITICAL**: Every time we make changes to `prisma/schema.prisma`:

1. **Assess Migration Need**: Check if changes require a database migration
   - New models, fields, or relationships = Migration needed
   - Field type changes = Migration needed
   - Index changes = Migration needed
   - Enum changes = Migration needed

2. **If Migration Needed**:
   ```bash
   npx prisma migrate dev --name <descriptive-name>
   npx prisma generate
   ```

3. **If No Migration Needed** (schema-only changes):
   ```bash
   npx prisma generate
   ```

4. **Always Verify**:
   - Check that the database schema is updated correctly
   - Verify Prisma client is regenerated
   - Test the changes work as expected
   - Run `yarn build` to ensure no TypeScript errors

## 🚨 PRISMA COMMAND RULES
- ✅ **ALWAYS use**: `npx prisma migrate dev` for schema changes
- ✅ **ALWAYS use**: `npx prisma generate` after changes
- ❌ **NEVER use**: `npx prisma db push` - This bypasses migration history and can cause data loss
- ❌ **NEVER use**: `prisma db push` - Always use proper migrations

**Examples of Changes Requiring Migration**:
- Adding new models
- Adding/removing fields
- Changing field types
- Adding/removing indexes
- Adding/removing relationships
- Changing enum values

**Examples of Changes NOT Requiring Migration**:
- Adding comments to schema
- Reordering fields (without changing types)
- Adding/removing comments only

## Brazilian Requirements
- Portuguese language (Brazil)
- Brazilian date format (DD/MM/YYYY)
- Brazilian currency (R$)
- LGPD compliance (mandatory)
- CFFa regulations

## Before Making Changes
1. Read the knowledge base documentation
2. Check similar implementations in the codebase
3. Follow established patterns
4. Test with `yarn build`
5. Ensure LGPD compliance is maintained

## When in Doubt
- Check the knowledge base first
- Look at similar code in the project
- Ask for clarification rather than guessing
- Prioritize security and LGPD compliance

## 🧠 Session Learning Integration
- **Session Data**: `.cursor/sessions/` - Personal development history
- **Learning Context**: `.cursor/sessions/context/` - AI learning data
- **Quick Commands**: Use `bank!` to save session, `session:*` commands for management
- **AI Learning**: Cursor AI learns from past sessions to avoid repeating mistakes
- **Personalized Assistance**: AI provides context-aware suggestions based on development history

# Almanaque da Fala Context for Cursor

## Project Overview
- **Name**: Almanaque da Fala (Almanaque da Fala)
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

## UI/UX Design Standards (Medium.com Inspired)

### Design System Principles
- **Clean Minimalism**: Lots of whitespace, minimal visual clutter
- **Content-First**: Typography and readability are paramount
- **Subtle Interactions**: Gentle hover effects and transitions
- **Reading-Focused**: Optimized for long-form content consumption
- **Responsive Design**: Mobile-first with excellent tablet/desktop experience

### Color Palette (Medium-Inspired)
- **Primary Text**: `text-gray-900` (almost black for readability)
- **Secondary Text**: `text-gray-600` (medium gray for body text)
- **Muted Text**: `text-gray-500` (light gray for metadata)
- **Accent**: `text-green-600` (Medium's signature green)
- **Backgrounds**: `bg-white` (clean white) and `bg-gray-50` (subtle gray)
- **Borders**: `border-gray-200` (very light borders)
- **Hover States**: `hover:bg-gray-50` (subtle gray on hover)

### Typography (Medium-Style)
- **Font Family**: `font-serif` (serif for body text like Medium)
- **H1 (Article Title)**: `text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight`
- **H2 (Section Headers)**: `text-2xl md:text-3xl font-bold text-gray-900 leading-tight`
- **H3 (Subsections)**: `text-xl md:text-2xl font-semibold text-gray-900 leading-tight`
- **Body Text**: `text-lg md:text-xl text-gray-600 leading-relaxed font-serif`
- **Small Text**: `text-sm text-gray-500 leading-relaxed`
- **Meta Text**: `text-sm text-gray-500` (dates, author, tags)

### Component Standards (Medium-Style)
- **Buttons**: 
  - Primary: `bg-gray-900 text-white hover:bg-gray-800 px-4 py-2 rounded-full text-sm font-medium`
  - Secondary: `border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-full text-sm font-medium`
  - Ghost: `text-gray-600 hover:text-gray-900 px-2 py-1 text-sm font-medium`
- **Cards**: 
  - Clean white background with subtle shadow
  - Rounded corners: `rounded-lg` (less rounded than before)
  - Hover effects: `hover:shadow-md transition-shadow duration-200`
- **Tags/Pills**: 
  - Subtle styling: `bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm`
  - Hover: `hover:bg-gray-200 transition-colors duration-200`

### Layout Patterns (Medium-Inspired)
- **Content Width**: Max width `max-w-4xl` for optimal reading
- **Article Layout**: Centered content with generous margins
- **Card Grids**: `grid md:grid-cols-2 lg:grid-cols-3 gap-8` (more spacing)
- **Reading Experience**: `prose prose-lg max-w-none` for rich text
- **Sidebar**: Optional sidebar for related content
- **Sticky Elements**: Subtle sticky navigation and CTAs

### Spacing (Medium-Style)
- **Section Spacing**: `py-16 md:py-20 lg:py-24` (generous vertical spacing)
- **Card Padding**: `p-6 md:p-8` (comfortable internal spacing)
- **Text Spacing**: `mb-6 md:mb-8` (breathing room between elements)
- **Grid Gaps**: `gap-6 md:gap-8` (comfortable spacing between cards)

### Accessibility Standards
- **Alt Text**: All images must have descriptive alt text
- **ARIA Labels**: Use `aria-label` and `aria-labelledby` for navigation
- **Focus States**: Ensure keyboard navigation works properly
- **Color Contrast**: Maintain WCAG AA compliance
- **Screen Readers**: Use `aria-hidden="true"` for decorative icons

### Brazilian Requirements
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

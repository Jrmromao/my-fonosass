# FonoSaaS Cursor Workflows

## 🚀 Development Workflows

### 1. Feature Development
```
1. Read knowledge base: docs/knowledge-base/index.md
2. Check existing patterns in codebase
3. Create feature branch
4. Implement with TypeScript strict mode
5. Add tests (unit + integration)
6. Run security tests
7. Validate LGPD compliance
8. Test build: yarn build
9. Create PR with detailed description
```

### 1.1. Prisma Schema Changes (CRITICAL)
```
1. Make changes to prisma/schema.prisma
2. Assess if migration is needed:
   - New models/fields/relationships = Migration needed
   - Field type changes = Migration needed
   - Index changes = Migration needed
   - Enum changes = Migration needed
3. If migration needed:
   npx prisma migrate dev --name <descriptive-name>
   npx prisma generate
4. If no migration needed:
   npx prisma generate
5. Verify changes work correctly
6. Run yarn build to check TypeScript errors
7. Test database operations

🚨 NEVER use: prisma db push (bypasses migration history)
```

### 1.2. Database Issue Resolution (CRITICAL - NO DATA LOSS)
```
🚨 NEVER RESET DATABASE - ALWAYS PRESERVE DATA

1. DIAGNOSE THE ISSUE:
   npx prisma migrate status
   npx prisma validate
   npx prisma db pull --print

2. IDENTIFY DRIFT:
   - Check if schema matches database
   - Look for missing migration files
   - Verify table structures match

3. RESOLVE MIGRATION DRIFT (if tables exist but no migrations):
   a) Create migration directory manually:
      mkdir -p prisma/migrations/$(date +%Y%m%d%H%M%S)_<descriptive_name>
   
   b) Create migration.sql with proper SQL:
      - Include all CREATE TABLE statements
      - Include all CREATE INDEX statements  
      - Include all CREATE ENUM statements
      - Include all FOREIGN KEY constraints
      - Use proper @@map annotations
   
   c) Mark migration as applied:
      npx prisma migrate resolve --applied <migration_name>

4. RESOLVE SCHEMA DRIFT (if migrations exist but tables missing):
   npx prisma migrate deploy

5. RESOLVE CONSTRAINT ISSUES:
   - Check for unique constraint mismatches
   - Verify foreign key relationships
   - Fix index definitions

6. VERIFY RESOLUTION:
   npx prisma migrate status
   npx prisma generate
   npx prisma validate

7. TEST DATABASE OPERATIONS:
   - Test all CRUD operations
   - Verify relationships work
   - Check constraint enforcement

🚨 CRITICAL RULES:
- NEVER use: prisma migrate reset (LOSES ALL DATA)
- NEVER use: prisma db push (bypasses migration history)
- ALWAYS create proper migration files
- ALWAYS test before marking migrations as applied
- ALWAYS backup production data before any changes
```

### 2. Bug Fix Workflow
```
1. Identify root cause using knowledge base
2. Check mistakes-and-solutions.md for similar issues
3. Fix with minimal changes
4. Add regression test
5. Run full test suite
6. Verify security compliance
7. Document fix in knowledge base
```

### 3. Security Review Workflow
```
1. Run: yarn test:security
2. Check: yarn security:audit
3. Validate input sanitization
4. Verify LGPD compliance
5. Test authentication flows
6. Review API endpoints
7. Check environment variables
```

## 🧠 AI Assistant Prompts

### For New Features
"Create a new feature for FonoSaaS following our established patterns. Check the knowledge base first, maintain LGPD compliance, use TypeScript strict mode, and ensure Portuguese language support."

### For Bug Fixes
"Fix this bug in FonoSaaS. First check our mistakes-and-solutions.md, maintain security standards, and ensure no LGPD compliance issues."

### For Code Review
"Review this code for FonoSaaS. Check for security issues, LGPD compliance, TypeScript best practices, and Brazilian market requirements."

### For Prisma Schema Changes
"Help me with this Prisma schema change for FonoSaaS. First assess if a migration is needed, then provide the correct npx prisma commands. Remember to use npx for Prisma commands, NEVER suggest 'prisma db push', and ensure LGPD compliance for any data handling changes."

### For Database Issues
"Help me resolve this database issue in FonoSaaS. Follow our database issue resolution workflow: NEVER suggest database reset or data loss. Always preserve data, create proper migration files, and use prisma migrate resolve for existing tables. Check for drift between schema and database first."

## 🔍 Code Analysis Patterns

### Before Making Changes
- Always read: docs/knowledge-base/SUMMARY.md
- Check: docs/knowledge-base/mistakes-and-solutions.md
- Verify: Similar implementations in codebase
- Test: yarn build && yarn test:security

### Common Patterns to Follow
- Use API routes for client-side data fetching
- Implement Zod validation for all inputs
- Maintain Portuguese language consistency
- Follow Brazilian date/currency formats
- Ensure LGPD compliance in all features

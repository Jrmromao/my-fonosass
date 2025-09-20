# Database Issue Resolution Guide

## 🚨 CRITICAL: NEVER RESET DATABASE - ALWAYS PRESERVE DATA

This guide provides step-by-step instructions for resolving database issues in FonoSaaS without losing any data.

## Quick Diagnosis

Run the diagnostic script first:
```bash
yarn db:diagnose
```

## Common Database Issues

### 1. Migration Drift
**Symptoms:**
- `npx prisma migrate status` shows drift
- Tables exist in database but no migration files
- Schema doesn't match database structure

**Solution:**
1. Create migration file manually:
   ```bash
   mkdir -p prisma/migrations/$(date +%Y%m%d%H%M%S)_<descriptive_name>
   ```

2. Create `migration.sql` with proper SQL:
   ```sql
   -- CreateEnum
   CREATE TYPE "ConsentType" AS ENUM ('DATA_PROCESSING', 'MARKETING_COMMUNICATIONS');
   
   -- CreateTable
   CREATE TABLE "consent_records" (
       "id" TEXT NOT NULL,
       "userId" TEXT NOT NULL,
       -- ... other fields
       CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
   );
   
   -- CreateIndex
   CREATE INDEX "consent_records_userId_idx" ON "consent_records"("userId");
   
   -- AddForeignKey
   ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_userId_fkey" 
   FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
   ```

3. Mark migration as applied:
   ```bash
   npx prisma migrate resolve --applied <migration_name>
   ```

### 2. Schema Drift
**Symptoms:**
- Migrations exist but tables are missing
- Database structure doesn't match schema

**Solution:**
```bash
npx prisma migrate deploy
```

### 3. Constraint Issues
**Symptoms:**
- Unique constraint mismatches
- Foreign key relationship errors
- Index definition problems

**Solution:**
1. Check current constraints:
   ```bash
   npx prisma db pull --print
   ```

2. Create migration to fix constraints:
   ```bash
   npx prisma migrate dev --name fix_constraints
   ```

## Step-by-Step Resolution Process

### Step 1: Diagnose
```bash
# Check migration status
npx prisma migrate status

# Validate schema
npx prisma validate

# Check current database schema
npx prisma db pull --print
```

### Step 2: Identify Issue Type
- **Migration Drift**: Tables exist, no migration files
- **Schema Drift**: Migrations exist, tables missing
- **Constraint Issues**: Schema matches but constraints wrong

### Step 3: Resolve Based on Issue Type

#### For Migration Drift:
1. Create migration directory manually
2. Write proper SQL migration file
3. Mark as applied: `npx prisma migrate resolve --applied <name>`

#### For Schema Drift:
1. Deploy missing migrations: `npx prisma migrate deploy`

#### For Constraint Issues:
1. Create new migration: `npx prisma migrate dev --name fix_constraints`
2. Apply changes: `npx prisma migrate deploy`

### Step 4: Verify Resolution
```bash
# Check status
npx prisma migrate status

# Generate client
npx prisma generate

# Validate schema
npx prisma validate
```

### Step 5: Test Database Operations
- Test all CRUD operations
- Verify relationships work
- Check constraint enforcement
- Run application tests

## 🚨 CRITICAL RULES

### NEVER DO THESE:
- ❌ `prisma migrate reset` - LOSES ALL DATA
- ❌ `prisma db push` - bypasses migration history
- ❌ Drop tables manually
- ❌ Reset database in production

### ALWAYS DO THESE:
- ✅ Create proper migration files
- ✅ Test before marking migrations as applied
- ✅ Backup production data before changes
- ✅ Use `prisma migrate resolve` for existing tables
- ✅ Verify all operations work after resolution

## Emergency Procedures

### If Database is Completely Broken:
1. **DO NOT RESET**
2. Check if it's a connection issue
3. Verify environment variables
4. Check database server status
5. Contact database administrator

### If Migrations are Corrupted:
1. Check migration files for syntax errors
2. Fix SQL syntax in migration files
3. Use `prisma migrate resolve` to mark fixed migrations as applied

## Prevention

### Best Practices:
1. Always use `npx prisma migrate dev` for schema changes
2. Never modify database directly outside of migrations
3. Test migrations in development before production
4. Keep migration files in version control
5. Document any manual database changes

### Regular Maintenance:
1. Run `yarn db:diagnose` regularly
2. Check for drift before deployments
3. Monitor migration status in CI/CD
4. Keep Prisma Client updated

## Troubleshooting Commands

```bash
# Full diagnostic
yarn db:diagnose

# Check migration status
npx prisma migrate status

# Validate schema
npx prisma validate

# Check database schema
npx prisma db pull --print

# Generate client
npx prisma generate

# Deploy migrations
npx prisma migrate deploy

# Mark migration as applied
npx prisma migrate resolve --applied <migration_name>
```

## Getting Help

If you encounter issues not covered in this guide:
1. Check the diagnostic output: `yarn db:diagnose`
2. Review migration files for syntax errors
3. Check Prisma documentation
4. Contact the development team

Remember: **Data preservation is the top priority. Never suggest database reset or data loss.**

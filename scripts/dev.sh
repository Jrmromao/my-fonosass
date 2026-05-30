#!/bin/bash
# Start FonoSaaS dev environment
set -e

echo "Starting FonoSaaS dev environment..."

# Check Colima/Docker
if ! docker info > /dev/null 2>&1; then
  echo "Docker not running. Start Colima first: colima start"
  exit 1
fi

# Check if postgres container exists
if ! docker ps --format '{{.Names}}' | grep -q "prompt-craft-dev-postgres"; then
  echo "Postgres container not running. Start it first."
  exit 1
fi

# Ensure fonosass database exists
PGPASSWORD=costlens_dev psql -h localhost -p 5434 -U costlens -d costlens_dev -c "SELECT 1 FROM pg_database WHERE datname='fonosass'" | grep -q 1 || \
  PGPASSWORD=costlens_dev psql -h localhost -p 5434 -U costlens -d costlens_dev -c "CREATE DATABASE fonosass;"

# Push schema (idempotent, no reset)
npx prisma db push --skip-generate 2>/dev/null || true
npx prisma generate 2>/dev/null

# Seed if empty
ACTIVITY_COUNT=$(PGPASSWORD=costlens_dev psql -h localhost -p 5434 -U costlens -d fonosass -t -c "SELECT COUNT(*) FROM \"Activity\";" 2>/dev/null || echo "0")
if [ "$(echo $ACTIVITY_COUNT | tr -d ' ')" = "0" ]; then
  echo "Database empty — seeding..."
  ./scripts/seed-dev.sh
else
  echo "Database has $(echo $ACTIVITY_COUNT | tr -d ' ') activities"
fi

# Start Next.js
echo "Starting Next.js..."
export DATABASE_URL="postgresql://costlens:costlens_dev@localhost:5434/fonosass?schema=public"
export DIRECT_URL="postgresql://costlens:costlens_dev@localhost:5434/fonosass?schema=public"
exec next dev --turbopack

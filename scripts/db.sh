#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# scripts/db.sh — safe DB utility for Almanaque da Fala.
#
# Loads credentials from .env.db (git-ignored) and exposes ONLY migration-based
# operations. Enforces the project's ABSOLUTE rule: schema changes go through
# migrations, never `prisma db push` / `db execute` / raw SQL.
#
# Usage:
#   ./scripts/db.sh status            # show applied vs pending migrations (safe, read-only)
#   ./scripts/db.sh deploy            # apply pending migrations (prod-safe, non-interactive)
#   ./scripts/db.sh new <name>        # create+apply a new migration (DEV only)
#   ./scripts/db.sh studio            # open Prisma Studio against the configured DB
#   ./scripts/db.sh url               # print which host/db is configured (no password)
#
# Env:
#   ENV_FILE   path to the env file to source (default: .env.db)
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${ENV_FILE:-.env.db}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "✗ $ENV_FILE not found. Copy the placeholders and fill in your creds." >&2
  exit 1
fi

# Load env (export everything defined in the file).
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [[ -z "${DATABASE_URL:-}" || "$DATABASE_URL" == *"USER:PASSWORD"* ]]; then
  echo "✗ DATABASE_URL is not set (still a placeholder?) in $ENV_FILE" >&2
  exit 1
fi

# Print the target host/db WITHOUT leaking the password.
safe_target() {
  echo "${DATABASE_URL}" | sed -E 's#(://[^:]+:)[^@]*(@)#\1*****\2#'
}

cmd="${1:-}"
case "$cmd" in
  status)
    echo "→ migrate status against: $(safe_target)"
    npx prisma migrate status
    ;;
  deploy)
    echo "→ migrate deploy against: $(safe_target)"
    echo "  (applies all pending migrations; additive, non-interactive)"
    npx prisma migrate deploy
    ;;
  new)
    name="${2:-}"
    if [[ -z "$name" ]]; then echo "✗ usage: db.sh new <migration_name>" >&2; exit 1; fi
    echo "⚠ DEV ONLY — creates and applies a migration against: $(safe_target)"
    npx prisma migrate dev --name "$name"
    ;;
  studio)
    npx prisma studio
    ;;
  url)
    echo "configured target: $(safe_target)"
    ;;
  push|db-push|execute)
    echo "✗ Refused. '$cmd' bypasses migrations, which is forbidden in this project." >&2
    echo "  Use: ./scripts/db.sh new <name>   (dev)   or   ./scripts/db.sh deploy   (prod)" >&2
    exit 1
    ;;
  ""|-h|--help|help)
    sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'
    ;;
  *)
    echo "✗ unknown command: $cmd (run './scripts/db.sh help')" >&2
    exit 1
    ;;
esac

#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# scripts/db-check.sh — read-only DB connectivity & visibility checker.
#
# Verifies a given DB user can (a) connect and (b) actually SEE rows. Useful for
# diagnosing the "query returns 0 rows but data exists" case caused by RLS being
# enabled with no policies (a silent deny-all for non-privileged roles).
#
# Credentials are read from .env.db (git-ignored) — NEVER passed on the CLI and
# NEVER printed. Only SELECT/count queries are run; this script cannot mutate data.
#
# Setup — add ONE of these to .env.db (do NOT commit real values):
#   CHECK_DATABASE_URL="postgresql://app_user:PASSWORD@db.<ref>.supabase.co:5432/postgres"
#   # (falls back to DATABASE_URL if CHECK_DATABASE_URL is unset)
#
# Usage:
#   ./scripts/db-check.sh ping                 # can we connect? who are we?
#   ./scripts/db-check.sh count <table>        # SELECT count(*) as the check role
#   ./scripts/db-check.sh rls <table>          # show RLS state + policy count for a table
#   ./scripts/db-check.sh url                  # print target host/user (no password)
#
# Requires: psql (brew install libpq  OR  brew install postgresql).
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${ENV_FILE:-.env.db}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "✗ $ENV_FILE not found. Copy the placeholders and fill in your creds." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

# Prefer a dedicated check URL; fall back to DATABASE_URL.
CONN="${CHECK_DATABASE_URL:-${DATABASE_URL:-}}"

if [[ -z "$CONN" || "$CONN" == *"USER:PASSWORD"* || "$CONN" == *"PASSWORD@"* ]]; then
  echo "✗ No usable connection string. Set CHECK_DATABASE_URL in $ENV_FILE" >&2
  echo "  e.g. CHECK_DATABASE_URL=\"postgresql://app_user:...@db.<ref>.supabase.co:5432/postgres\"" >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "✗ psql not found. Install with:  brew install libpq  (then add it to PATH)" >&2
  exit 1
fi

# Print the target WITHOUT leaking the password.
safe_target() {
  echo "$CONN" | sed -E 's#(://[^:]+:)[^@]*(@)#\1*****\2#'
}

# Reject anything that isn't a bare identifier, to keep queries SELECT-only & injection-safe.
assert_ident() {
  if [[ ! "$1" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
    echo "✗ invalid table name: '$1' (identifiers only, no quotes/spaces)" >&2
    exit 1
  fi
}

run_sql() { psql "$CONN" -X -A -t -v ON_ERROR_STOP=1 -c "$1"; }

cmd="${1:-}"
case "$cmd" in
  ping)
    echo "→ connecting to: $(safe_target)"
    run_sql "select 'connected as ' || current_user || ' @ ' || current_database() || ' (v' || current_setting('server_version') || ')';"
    ;;
  count)
    tbl="${2:-}"
    [[ -z "$tbl" ]] && { echo "✗ usage: db-check.sh count <table>" >&2; exit 1; }
    assert_ident "$tbl"
    echo "→ counting public.\"$tbl\" as $(safe_target)"
    run_sql "select count(*) || ' rows visible in public.\"$tbl\"' from public.\"$tbl\";"
    ;;
  rls)
    tbl="${2:-}"
    [[ -z "$tbl" ]] && { echo "✗ usage: db-check.sh rls <table>" >&2; exit 1; }
    assert_ident "$tbl"
    echo "→ RLS state for public.\"$tbl\""
    run_sql "select 'rls_enabled=' || c.relrowsecurity || ' forced=' || c.relforcerowsecurity || ' policies=' || (select count(*) from pg_policies p where p.schemaname='public' and p.tablename=c.relname) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='$tbl';"
    ;;
  url)
    echo "configured target: $(safe_target)"
    ;;
  ""|-h|--help|help)
    sed -n '2,28p' "$0" | sed 's/^# \{0,1\}//'
    ;;
  *)
    echo "✗ unknown command: $cmd (run './scripts/db-check.sh help')" >&2
    exit 1
    ;;
esac

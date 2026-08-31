#!/usr/bin/env bash
set -euo pipefail

: "${BACKUP_DATABASE_URL:?BACKUP_DATABASE_URL is required}"
: "${BACKUP_ENCRYPTION_KEY:?BACKUP_ENCRYPTION_KEY is required}"

backup_dir="${BACKUP_DIRECTORY:-./backups}"
retention_days="${BACKUP_RETENTION_DAYS:-30}"
mkdir -p "$backup_dir"

case "$backup_dir" in
  /|"$HOME") echo "Refusing unsafe BACKUP_DIRECTORY: $backup_dir" >&2; exit 1 ;;
esac

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
plain_file="$(mktemp "${TMPDIR:-/tmp}/piggy-bank-${timestamp}.XXXXXX.dump")"
encrypted_file="${backup_dir%/}/piggy-bank-${timestamp}.dump.enc"
trap 'rm -f "$plain_file"' EXIT

pg_dump --dbname="$BACKUP_DATABASE_URL" --format=custom --compress=9 --no-owner --no-privileges --file="$plain_file"
openssl enc -aes-256-cbc -salt -pbkdf2 -iter 200000 -in "$plain_file" -out "$encrypted_file" -pass env:BACKUP_ENCRYPTION_KEY
openssl dgst -sha256 "$encrypted_file" > "${encrypted_file}.sha256"

find "$backup_dir" -type f \( -name 'piggy-bank-*.dump.enc' -o -name 'piggy-bank-*.dump.enc.sha256' \) -mtime "+$retention_days" -delete
echo "$encrypted_file"

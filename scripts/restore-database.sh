#!/usr/bin/env bash
set -euo pipefail

: "${BACKUP_ENCRYPTION_KEY:?BACKUP_ENCRYPTION_KEY is required}"
if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <encrypted-backup> <target-database-url>" >&2
  exit 2
fi

encrypted_file="$1"
target_url="$2"
if [[ ! -f "$encrypted_file" ]]; then
  echo "Backup not found: $encrypted_file" >&2
  exit 1
fi

plain_file="$(mktemp "${TMPDIR:-/tmp}/piggy-bank-restore.XXXXXX.dump")"
trap 'rm -f "$plain_file"' EXIT

if [[ -f "${encrypted_file}.sha256" ]]; then
  expected="$(awk '{print $2}' "${encrypted_file}.sha256")"
  actual="$(openssl dgst -sha256 "$encrypted_file" | awk '{print $2}')"
  [[ "$expected" == "$actual" ]] || { echo "Backup checksum mismatch." >&2; exit 1; }
fi

openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -in "$encrypted_file" -out "$plain_file" -pass env:BACKUP_ENCRYPTION_KEY
pg_restore --dbname="$target_url" --clean --if-exists --no-owner --no-privileges --exit-on-error "$plain_file"
echo "Restore completed successfully."

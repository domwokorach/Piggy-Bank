# Backend architecture

The production data path is:

```text
Next.js client → Route Handler → Supabase Auth → service/domain logic
               → Prisma transaction → PostgreSQL → Supabase Realtime → client refresh
```

PostgreSQL is the source of truth. Browser state is a display cache only. React components never import Prisma or connect to PostgreSQL.

## Identity and authorization

Supabase owns credentials, OTP verification, password recovery, MFA factors, and access/refresh tokens. `profiles.id` is the same UUID as `auth.users.id`; the migration enforces that relationship. Every sensitive Route Handler calls `getAuthenticatedUser()` and scopes database reads and writes to that profile. The database exposes only authenticated `SELECT` policies needed for Realtime. All mutations use the server's pooled Prisma connection.

## Money movement

Balances and transaction amounts are `DECIMAL(12,2)`. `/api/transfers` resolves account ownership on the server and runs the conditional debit, credit, immutable transaction row, and notification in one serializable Prisma transaction. A database check constraint prevents a negative balance even if application logic regresses.

## Realtime

The migration enables RLS, full replica identity, and the `supabase_realtime` publication for accounts, cards, transactions, notifications, and devices. The dashboard subscribes with the caller's Supabase session and refreshes its server-backed cache after an allowed change.

## Backups and recovery

The daily workflow creates a custom-format `pg_dump`, encrypts it with AES-256 and PBKDF2, records a checksum, restores it into a clean PostgreSQL service as a test, and retains the encrypted artifact for 30 days. Configure `BACKUP_DATABASE_URL` with Supabase's direct connection, never the transaction pooler.

Supabase point-in-time recovery is a provider-side setting and must be enabled for the production project/plan. Daily logical backups complement PITR; they do not replace it. Run a manual recovery drill at least quarterly and record recovery-point and recovery-time results.

Deploy migrations with `npx prisma migrate deploy`. To restore locally:

```bash
BACKUP_ENCRYPTION_KEY='...' ./scripts/restore-database.sh backups/piggy-bank-....dump.enc 'postgresql://.../restore_test'
```

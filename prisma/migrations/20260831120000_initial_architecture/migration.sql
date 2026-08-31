CREATE TYPE "AccountStatus" AS ENUM ('PENDING', 'ACTIVE', 'PENDING_CLOSURE', 'CLOSED');
CREATE TYPE "ProfileRole" AS ENUM ('CUSTOMER', 'ADMIN');
CREATE TYPE "DeviceType" AS ENUM ('MOBILE_PHONE', 'TABLET', 'DESKTOP', 'UNKNOWN');
CREATE TYPE "LoginStatus" AS ENUM ('SUCCESS', 'FAILED', 'BLOCKED');
CREATE TYPE "AccountType" AS ENUM ('PARENT', 'KID');
CREATE TYPE "CardBrand" AS ENUM ('VISA', 'MASTERCARD');
CREATE TYPE "CardStatus" AS ENUM ('ACTIVE', 'FROZEN', 'LOCKED', 'CANCELLED');
CREATE TYPE "TransactionType" AS ENUM ('PAYMENT', 'TRANSFER', 'DEPOSIT', 'SPEND', 'SAVINGS');
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REVERSED');
CREATE TYPE "NotificationType" AS ENUM ('PAYMENT_RECEIVED', 'TRANSFER_COMPLETED', 'TRANSFER_FAILED', 'NEW_LOGIN', 'SUSPICIOUS_LOGIN', 'CARD_FROZEN', 'CARD_UNLOCKED', 'ACCOUNT_LOCKED', 'ACCOUNT_UNLOCKED', 'NEW_KID_ACCOUNT', 'ACCOUNT_APPROVED', 'PIN_VERIFICATION', 'SAVINGS_TARGET_REACHED', 'ACCOUNT_CLOSURE_REQUESTED', 'ACCOUNT_CLOSURE_CANCELLED', 'ACCOUNT_CLOSED', 'CARD_DETAILS_VIEWED');

CREATE TABLE "profiles" (
  "id" UUID PRIMARY KEY,
  "firstName" TEXT NOT NULL, "lastName" TEXT NOT NULL, "dob" TIMESTAMP(3) NOT NULL,
  "mobile" TEXT NOT NULL, "email" TEXT NOT NULL, "username" TEXT NOT NULL, "avatarUrl" TEXT,
  "addressLine1" TEXT, "addressLine2" TEXT, "city" TEXT, "postcode" TEXT, "country" TEXT,
  "customerNumber" TEXT NOT NULL, "status" "AccountStatus" NOT NULL DEFAULT 'PENDING',
  "role" "ProfileRole" NOT NULL DEFAULT 'CUSTOMER', "lastLoginAt" TIMESTAMP(3),
  "mustResetPassword" BOOLEAN NOT NULL DEFAULT false, "deletionPinHash" TEXT,
  "deletionPinExpiresAt" TIMESTAMP(3), "deletionAttempts" INTEGER NOT NULL DEFAULT 0,
  "deletionPinLastSentAt" TIMESTAMP(3), "deletionVerifiedAt" TIMESTAMP(3),
  "closureRequestedAt" TIMESTAMP(3), "closedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "devices" (
  "id" TEXT PRIMARY KEY, "profileId" UUID NOT NULL, "deviceId" TEXT NOT NULL,
  "label" TEXT NOT NULL, "deviceType" "DeviceType" NOT NULL DEFAULT 'UNKNOWN',
  "os" TEXT, "browser" TEXT, "model" TEXT, "trusted" BOOLEAN NOT NULL DEFAULT false,
  "lastIp" TEXT, "lastCity" TEXT, "lastCountry" TEXT,
  "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "confirmedAt" TIMESTAMP(3), "blockedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "login_sessions" (
  "id" TEXT PRIMARY KEY, "profileId" UUID NOT NULL, "deviceRowId" TEXT,
  "userAgent" TEXT, "ip" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "logoutAt" TIMESTAMP(3),
  "logoutReason" TEXT, "revokedAt" TIMESTAMP(3)
);

CREATE TABLE "security_events" (
  "id" TEXT PRIMARY KEY, "profileId" UUID, "type" TEXT NOT NULL, "status" "LoginStatus",
  "deviceRowId" TEXT, "sessionId" TEXT, "isNewDevice" BOOLEAN, "ip" TEXT, "city" TEXT,
  "country" TEXT, "userAgent" TEXT, "os" TEXT, "browser" TEXT, "deviceType" "DeviceType",
  "confirmedAt" TIMESTAMP(3), "confirmedAsSelf" BOOLEAN, "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "accounts" (
  "id" TEXT PRIMARY KEY, "profileId" UUID NOT NULL, "parentAccountId" TEXT,
  "type" "AccountType" NOT NULL, "name" TEXT NOT NULL, "avatarUrl" TEXT, "color" TEXT,
  "accountNumber" TEXT NOT NULL, "sortCode" TEXT NOT NULL,
  "balance" DECIMAL(12,2) NOT NULL DEFAULT 0, "savingsTarget" DECIMAL(12,2),
  "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "accounts_nonnegative_balance" CHECK ("balance" >= 0),
  CONSTRAINT "accounts_nonnegative_target" CHECK ("savingsTarget" IS NULL OR "savingsTarget" >= 0),
  CONSTRAINT "accounts_parent_shape" CHECK (("type" = 'PARENT' AND "parentAccountId" IS NULL) OR ("type" = 'KID' AND "parentAccountId" IS NOT NULL))
);

CREATE TABLE "cards" (
  "id" TEXT PRIMARY KEY, "accountId" TEXT NOT NULL, "cardholderName" TEXT NOT NULL,
  "providerCardId" TEXT NOT NULL, "last4" TEXT NOT NULL, "brand" "CardBrand" NOT NULL,
  "expMonth" INTEGER NOT NULL, "expYear" INTEGER NOT NULL,
  "status" "CardStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "cards_last4_format" CHECK ("last4" ~ '^[0-9]{4}$'),
  CONSTRAINT "cards_exp_month" CHECK ("expMonth" BETWEEN 1 AND 12)
);

CREATE TABLE "transactions" (
  "id" TEXT PRIMARY KEY, "transactionNumber" TEXT NOT NULL, "profileId" UUID NOT NULL,
  "type" "TransactionType" NOT NULL, "status" "TransactionStatus" NOT NULL DEFAULT 'COMPLETED',
  "amount" DECIMAL(12,2) NOT NULL, "fromLabel" TEXT NOT NULL, "toLabel" TEXT NOT NULL,
  "fromAccountId" TEXT, "toAccountId" TEXT, "reference" TEXT, "category" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "completedAt" TIMESTAMP(3),
  CONSTRAINT "transactions_positive_amount" CHECK ("amount" > 0)
);

CREATE TABLE "notifications" (
  "id" TEXT PRIMARY KEY, "profileId" UUID NOT NULL, "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL, "message" TEXT NOT NULL, "read" BOOLEAN NOT NULL DEFAULT false,
  "actionLabel" TEXT, "actionHref" TEXT, "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");
CREATE UNIQUE INDEX "profiles_username_key" ON "profiles"("username");
CREATE UNIQUE INDEX "profiles_customerNumber_key" ON "profiles"("customerNumber");
CREATE UNIQUE INDEX "devices_profileId_deviceId_key" ON "devices"("profileId", "deviceId");
CREATE INDEX "devices_profileId_idx" ON "devices"("profileId");
CREATE INDEX "login_sessions_profileId_idx" ON "login_sessions"("profileId");
CREATE INDEX "login_sessions_profileId_revokedAt_idx" ON "login_sessions"("profileId", "revokedAt");
CREATE INDEX "security_events_profileId_idx" ON "security_events"("profileId");
CREATE INDEX "security_events_ip_idx" ON "security_events"("ip");
CREATE UNIQUE INDEX "accounts_accountNumber_key" ON "accounts"("accountNumber");
CREATE INDEX "accounts_profileId_idx" ON "accounts"("profileId");
CREATE INDEX "accounts_profileId_type_status_idx" ON "accounts"("profileId", "type", "status");
CREATE UNIQUE INDEX "cards_providerCardId_key" ON "cards"("providerCardId");
CREATE INDEX "cards_accountId_idx" ON "cards"("accountId");
CREATE INDEX "cards_accountId_status_idx" ON "cards"("accountId", "status");
CREATE UNIQUE INDEX "transactions_transactionNumber_key" ON "transactions"("transactionNumber");
CREATE INDEX "transactions_profileId_idx" ON "transactions"("profileId");
CREATE INDEX "transactions_profileId_createdAt_idx" ON "transactions"("profileId", "createdAt");
CREATE INDEX "notifications_profileId_idx" ON "notifications"("profileId");
CREATE INDEX "notifications_profileId_read_createdAt_idx" ON "notifications"("profileId", "read", "createdAt");

ALTER TABLE "profiles" ADD CONSTRAINT "profiles_auth_user_fkey" FOREIGN KEY ("id") REFERENCES auth.users("id") ON DELETE CASCADE;
ALTER TABLE "devices" ADD CONSTRAINT "devices_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "login_sessions" ADD CONSTRAINT "login_sessions_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_parentAccountId_fkey" FOREIGN KEY ("parentAccountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cards" ADD CONSTRAINT "cards_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_fromAccountId_fkey" FOREIGN KEY ("fromAccountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_toAccountId_fkey" FOREIGN KEY ("toAccountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "devices" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON "profiles" FOR SELECT TO authenticated USING ("id" = auth.uid());
CREATE POLICY "accounts_select_own" ON "accounts" FOR SELECT TO authenticated USING ("profileId" = auth.uid());
CREATE POLICY "cards_select_own" ON "cards" FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM "accounts" a WHERE a."id" = "cards"."accountId" AND a."profileId" = auth.uid()));
CREATE POLICY "transactions_select_own" ON "transactions" FOR SELECT TO authenticated USING ("profileId" = auth.uid());
CREATE POLICY "notifications_select_own" ON "notifications" FOR SELECT TO authenticated USING ("profileId" = auth.uid());
CREATE POLICY "devices_select_own" ON "devices" FOR SELECT TO authenticated USING ("profileId" = auth.uid());
GRANT SELECT ON "profiles", "accounts", "cards", "transactions", "notifications", "devices" TO authenticated;

ALTER TABLE "accounts" REPLICA IDENTITY FULL;
ALTER TABLE "cards" REPLICA IDENTITY FULL;
ALTER TABLE "transactions" REPLICA IDENTITY FULL;
ALTER TABLE "notifications" REPLICA IDENTITY FULL;
ALTER TABLE "devices" REPLICA IDENTITY FULL;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE "accounts", "cards", "transactions", "notifications", "devices";
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

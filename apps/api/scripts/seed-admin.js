/* eslint-disable */
/**
 * Seeds a fully-onboarded "admin" account (michael@jakob.tv) with realistic
 * banking test data (account, cards, transactions, recipients, notifications,
 * payment requests, FX rates) directly into the Supabase Postgres database.
 *
 * Why this exists:
 * - The app's `SKIP_AUTH=true` dev mode runs against in-memory SQLite, so it
 *   never touches the real DB. This script populates the real Supabase Postgres
 *   so the account works once the app runs in normal (Postgres) mode.
 *
 * Connection notes:
 * - Supabase direct host `db.<ref>.supabase.co` is IPv6-only. On IPv4-only
 *   networks you must use the Supavisor pooler (IPv4). This script auto-rewrites
 *   a direct host to the pooler host + `postgres.<ref>` user. Override the pooler
 *   host/region with SUPABASE_POOLER_HOST if your project lives elsewhere.
 *
 * Idempotent: re-running deletes michael@jakob.tv (FK cascade) and re-seeds.
 *
 * Run from apps/api:  node scripts/seed-admin.js
 * (loads apps/api/.env automatically)
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// ---- Load apps/api/.env (no extra deps) ----------------------------------
function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    const key = m[1];
    let val = m[2].replace(/^["']|["']$/g, '');
    if (process.env[key] === undefined) process.env[key] = val;
  }
}
loadEnv();

// ---- Resolve a working connection (rewrite direct host -> IPv4 pooler) ----
function resolveConnection() {
  let host = process.env.DB_HOST || 'localhost';
  let user = process.env.DB_USERNAME || 'postgres';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'postgres';
  let port = parseInt(process.env.DB_PORT || '5432', 10);

  const direct = host.match(/^db\.([a-z0-9]+)\.supabase\.co$/i);
  if (direct) {
    const ref = direct[1];
    // Direct host is IPv6-only; route through the regional pooler over IPv4.
    host =
      process.env.SUPABASE_POOLER_HOST ||
      'aws-1-ap-southeast-1.pooler.supabase.com';
    user = `postgres.${ref}`;
    port = parseInt(process.env.SUPABASE_POOLER_PORT || '5432', 10);
  }

  return {
    host,
    port,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 20000,
  };
}

// ---- Schema (mirrors TypeORM migrations, made idempotent) -----------------
const SCHEMA_SQL = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "email" character varying NOT NULL,
  "role" character varying NOT NULL DEFAULT 'user',
  "handle" character varying,
  "phone" character varying,
  "firstName" character varying NOT NULL,
  "lastName" character varying NOT NULL,
  "dateOfBirth" character varying NOT NULL,
  "nationality" character varying NOT NULL,
  "residenceCountry" character varying NOT NULL,
  "residenceAddress" text,
  "emailVerified" boolean NOT NULL DEFAULT false,
  "lastLoginAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "UQ_users_email" UNIQUE ("email"),
  CONSTRAINT "PK_users" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_users_handle" ON "users" ("handle");
-- role may be missing on an already-created users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" character varying NOT NULL DEFAULT 'user';
CREATE INDEX IF NOT EXISTS "IDX_users_role" ON "users" ("role");

CREATE TABLE IF NOT EXISTS "onboardings" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL,
  "status" character varying NOT NULL DEFAULT 'initiated',
  "providerOnboardingId" character varying,
  "providerRedirectUrl" character varying,
  "providerMetadata" text,
  "kycCompletedAt" TIMESTAMP,
  "accountCreatedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "REL_onboardings_user" UNIQUE ("userId"),
  CONSTRAINT "PK_onboardings" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "accounts" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL,
  "providerAccountId" character varying NOT NULL,
  "status" character varying NOT NULL DEFAULT 'active',
  "iban" character varying NOT NULL,
  "bic" character varying NOT NULL,
  "holderName" character varying NOT NULL,
  "balanceCents" bigint NOT NULL DEFAULT 0,
  "currency" character varying NOT NULL DEFAULT 'EUR',
  "lastReconciledAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_accounts" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_accounts_userId" ON "accounts" ("userId");
CREATE INDEX IF NOT EXISTS "IDX_accounts_user_currency" ON "accounts" ("userId", "currency");

CREATE TABLE IF NOT EXISTS "cards" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "accountId" uuid NOT NULL,
  "providerCardId" character varying NOT NULL,
  "type" character varying NOT NULL,
  "status" character varying NOT NULL DEFAULT 'active',
  "last4" character varying NOT NULL,
  "expiryMonth" integer NOT NULL,
  "expiryYear" integer NOT NULL,
  "cardholderName" character varying NOT NULL,
  "name" character varying,
  "frozen" boolean NOT NULL DEFAULT false,
  "onlineEnabled" boolean NOT NULL DEFAULT true,
  "contactlessEnabled" boolean NOT NULL DEFAULT true,
  "spendingLimit" text,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_cards" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_cards_accountId" ON "cards" ("accountId");

CREATE TABLE IF NOT EXISTS "transactions" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "accountId" uuid NOT NULL,
  "cardId" uuid,
  "providerTransactionId" character varying NOT NULL,
  "direction" character varying NOT NULL,
  "status" character varying NOT NULL DEFAULT 'pending',
  "amountCents" bigint NOT NULL,
  "currency" character varying NOT NULL DEFAULT 'EUR',
  "counterpartyName" character varying NOT NULL,
  "counterpartyIban" character varying,
  "reference" character varying,
  "category" character varying,
  "bookedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_transactions" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_transactions_account_created" ON "transactions" ("accountId", "createdAt");
CREATE INDEX IF NOT EXISTS "IDX_transactions_card_created" ON "transactions" ("cardId", "createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_transactions_providerTxId" ON "transactions" ("providerTransactionId");
CREATE INDEX IF NOT EXISTS "IDX_transactions_cardId_createdAt" ON "transactions" ("cardId", "createdAt");

CREATE TABLE IF NOT EXISTS "webhook_events" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "providerEventId" character varying NOT NULL,
  "eventType" character varying NOT NULL,
  "resourceId" character varying,
  "rawPayload" text NOT NULL,
  "processingStatus" character varying NOT NULL DEFAULT 'received',
  "processedAt" TIMESTAMP,
  "errorMessage" character varying,
  "receivedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_webhook_events" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_webhook_events_eventId" ON "webhook_events" ("providerEventId");

CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "userId" uuid,
  "action" character varying NOT NULL,
  "resourceType" character varying,
  "resourceId" character varying,
  "metadata" text,
  "ipAddress" character varying,
  "userAgent" character varying,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_audit_user_created" ON "audit_logs" ("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "IDX_audit_action_created" ON "audit_logs" ("action", "createdAt");

CREATE TABLE IF NOT EXISTS "recipients" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL,
  "name" character varying NOT NULL,
  "iban" character varying NOT NULL,
  "bic" character varying,
  "bank" character varying,
  "country" character varying,
  "email" character varying,
  "phone" character varying,
  "notes" text,
  "isFavorite" boolean NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_recipients" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_recipients_user_iban" ON "recipients" ("userId", "iban");

CREATE TABLE IF NOT EXISTS "payment_requests" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL,
  "amountCents" bigint NOT NULL,
  "currency" character varying NOT NULL DEFAULT 'EUR',
  "recipientEmail" character varying,
  "note" character varying,
  "status" character varying NOT NULL DEFAULT 'pending',
  "token" character varying NOT NULL,
  "expiresAt" TIMESTAMP,
  "paidAt" TIMESTAMP,
  "paidByName" character varying,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "UQ_payment_requests_token" UNIQUE ("token"),
  CONSTRAINT "PK_payment_requests" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_payment_requests_token_idx" ON "payment_requests" ("token");

CREATE TABLE IF NOT EXISTS "exchange_rates" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "baseCurrency" character varying NOT NULL,
  "targetCurrency" character varying NOT NULL,
  "rate" numeric(12,6) NOT NULL,
  "fetchedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_exchange_rates" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_exchange_rates_pair" ON "exchange_rates" ("baseCurrency", "targetCurrency");

CREATE TABLE IF NOT EXISTS "notifications" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL,
  "type" character varying NOT NULL,
  "title" character varying NOT NULL,
  "body" character varying NOT NULL,
  "read" boolean NOT NULL DEFAULT false,
  "metadata" text,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_notifications_user_created" ON "notifications" ("userId", "createdAt");

-- Foreign keys (guarded so re-runs don't fail)
DO $$ BEGIN
  ALTER TABLE "onboardings" ADD CONSTRAINT "FK_onboardings_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "accounts" ADD CONSTRAINT "FK_accounts_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "cards" ADD CONSTRAINT "FK_cards_account" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "transactions" ADD CONSTRAINT "FK_transactions_account" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "recipients" ADD CONSTRAINT "FK_recipients_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "payment_requests" ADD CONSTRAINT "FK_payment_requests_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "notifications" ADD CONSTRAINT "FK_notifications_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- TypeORM migration ledger: mark migrations as applied so the app's
-- migrationsRun:true boot path skips them (and dodges the AddCardId ordering bug).
CREATE TABLE IF NOT EXISTS "migrations" (
  "id" SERIAL NOT NULL,
  "timestamp" bigint NOT NULL,
  "name" character varying NOT NULL,
  CONSTRAINT "PK_migrations" PRIMARY KEY ("id")
);
INSERT INTO "migrations" ("timestamp", "name")
SELECT v.ts, v.name FROM (VALUES
  (1717000000000::bigint, 'AddCardIdToTransactions1717000000000'),
  (1717300000000::bigint, 'InitialSchema1717300000000'),
  (1717400000000::bigint, 'AddHandleToUsers1717400000000'),
  (1717500000000::bigint, 'AddRoleToUsers1717500000000')
) AS v(ts, name)
WHERE NOT EXISTS (SELECT 1 FROM "migrations" m WHERE m.name = v.name);
`;

// ---- Seed data ------------------------------------------------------------
const EMAIL = 'michael@jakob.tv';

function daysAgo(n, hour = 10, min = 0) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

async function main() {
  const conn = resolveConnection();
  const client = new Client(conn);
  await client.connect();
  console.log(`Connected to ${conn.host}:${conn.port} as ${conn.user}`);

  try {
    await client.query('BEGIN');

    console.log('Ensuring schema…');
    await client.query(SCHEMA_SQL);

    // Idempotent reset: removing the user cascades to all owned rows.
    await client.query('DELETE FROM "users" WHERE email = $1', [EMAIL]);

    // --- User ---
    const address = {
      line1: 'Maximilianstraße 35',
      city: 'München',
      postalCode: '80539',
      country: 'Germany',
    };
    const userRes = await client.query(
      `INSERT INTO "users"
        ("email","role","handle","phone","firstName","lastName","dateOfBirth","nationality","residenceCountry","residenceAddress","emailVerified","lastLoginAt")
       VALUES ($1,'admin',$2,$3,$4,$5,$6,$7,$8,$9,true,now())
       RETURNING id`,
      [
        EMAIL,
        'michael',
        '+49 170 5550123',
        'Michael',
        'Jakob',
        '1995-03-12',
        'DE',
        'DE',
        JSON.stringify(address),
      ],
    );
    const userId = userRes.rows[0].id;
    console.log(`User created: ${EMAIL} (${userId})`);

    // --- Onboarding (completed) ---
    await client.query(
      `INSERT INTO "onboardings"
        ("userId","status","providerOnboardingId","kycCompletedAt","accountCreatedAt")
       VALUES ($1,'completed',$2,$3,$4)`,
      [userId, 'onb_seed_michael', daysAgo(120), daysAgo(120)],
    );

    // --- Account ---
    const accRes = await client.query(
      `INSERT INTO "accounts"
        ("userId","providerAccountId","status","iban","bic","holderName","balanceCents","currency","lastReconciledAt")
       VALUES ($1,$2,'active',$3,$4,$5,$6,'EUR',now())
       RETURNING id`,
      [
        userId,
        'acc_seed_michael',
        'DE89370400440532013000',
        'COBADEFFXXX',
        'Michael Jakob',
        1845075, // €18,450.75
      ],
    );
    const accountId = accRes.rows[0].id;
    console.log(`Account created (${accountId})`);

    // --- Cards ---
    async function addCard(c) {
      const r = await client.query(
        `INSERT INTO "cards"
          ("accountId","providerCardId","type","status","last4","expiryMonth","expiryYear","cardholderName","name","frozen","onlineEnabled","contactlessEnabled","spendingLimit")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         RETURNING id`,
        [
          accountId,
          c.providerCardId,
          c.type,
          c.status || 'active',
          c.last4,
          c.expiryMonth,
          c.expiryYear,
          'Michael Jakob',
          c.name,
          c.frozen || false,
          c.onlineEnabled !== false,
          c.contactlessEnabled !== false,
          c.spendingLimit ? JSON.stringify(c.spendingLimit) : null,
        ],
      );
      return r.rows[0].id;
    }

    const mainCard = await addCard({
      providerCardId: 'card_seed_main',
      type: 'virtual',
      last4: '4289',
      expiryMonth: 12,
      expiryYear: 28,
      name: 'Main virtual',
      spendingLimit: { amount: 500000, period: 'monthly' },
    });
    const titaniumCard = await addCard({
      providerCardId: 'card_seed_titanium',
      type: 'physical',
      last4: '7831',
      expiryMonth: 6,
      expiryYear: 29,
      name: 'Titanium card',
      spendingLimit: { amount: 1000000, period: 'monthly' },
    });
    const subsCard = await addCard({
      providerCardId: 'card_seed_subs',
      type: 'virtual',
      last4: '0052',
      expiryMonth: 7,
      expiryYear: 26,
      name: 'Subscriptions',
      spendingLimit: { amount: 50000, period: 'monthly' },
    });
    const frozenCard = await addCard({
      providerCardId: 'card_seed_travel',
      type: 'virtual',
      status: 'frozen',
      last4: '1190',
      expiryMonth: 3,
      expiryYear: 27,
      name: 'Travel (frozen)',
      frozen: true,
      spendingLimit: { amount: 200000, period: 'monthly' },
    });
    console.log('Cards created: 4');

    // --- Transactions ---
    let txSeq = 0;
    async function addTx(t) {
      const when = t.when || daysAgo(t.daysAgo ?? 0, 9 + (txSeq % 10), (txSeq * 7) % 60);
      await client.query(
        `INSERT INTO "transactions"
          ("accountId","cardId","providerTransactionId","direction","status","amountCents","currency","counterpartyName","counterpartyIban","reference","category","bookedAt","createdAt")
         VALUES ($1,$2,$3,$4,$5,$6,'EUR',$7,$8,$9,$10,$11,$11)`,
        [
          accountId,
          t.cardId || null,
          `seed_michael_${txSeq++}`,
          t.direction,
          t.status || 'settled',
          t.amountCents,
          t.counterpartyName,
          t.counterpartyIban || null,
          t.reference || null,
          t.category || null,
          when,
        ],
      );
    }

    // Income (account-level, no card)
    await addTx({ direction: 'inbound', amountCents: 615000, counterpartyName: 'Auriga Capital GmbH', counterpartyIban: 'DE12500105170648489890', reference: 'Salary — June', category: 'income', daysAgo: 1 });
    await addTx({ direction: 'inbound', amountCents: 615000, counterpartyName: 'Auriga Capital GmbH', counterpartyIban: 'DE12500105170648489890', reference: 'Salary — May', category: 'income', daysAgo: 31 });
    await addTx({ direction: 'inbound', amountCents: 24500, counterpartyName: 'Stripe Payments', reference: 'Payout', category: 'income', daysAgo: 8 });
    await addTx({ direction: 'inbound', amountCents: 5000, counterpartyName: 'Anna Schmidt', reference: 'Dinner split', category: 'transfer', daysAgo: 5 });

    // Main card — everyday spending
    const main = [
      { merchant: 'Whole Foods Market', category: 'groceries', amountCents: 6720, daysAgo: 0, reference: 'Weekly groceries' },
      { merchant: 'Uber', category: 'transport', amountCents: 1840, daysAgo: 0, reference: 'Ride home' },
      { merchant: 'Starbucks', category: 'food', amountCents: 575, daysAgo: 1, reference: 'Flat white' },
      { merchant: 'Amazon', category: 'shopping', amountCents: 15900, daysAgo: 2, reference: 'USB-C hub' },
      { merchant: 'Shell', category: 'transport', amountCents: 7240, daysAgo: 4, reference: 'Fuel' },
      { merchant: 'IKEA', category: 'shopping', amountCents: 23400, daysAgo: 6, reference: 'Desk lamp & shelves' },
      { merchant: 'Amazon', category: 'shopping', amountCents: 4200, direction: 'inbound', daysAgo: 7, reference: 'Refund — returned item' },
      { merchant: 'Lidl', category: 'groceries', amountCents: 4310, daysAgo: 9, reference: 'Groceries' },
      { merchant: 'Deliveroo', category: 'food', amountCents: 3290, daysAgo: 12, reference: 'Dinner' },
      { merchant: 'Apple Store', category: 'shopping', amountCents: 12900, daysAgo: 18, reference: 'MagSafe charger' },
      { merchant: 'Decathlon', category: 'shopping', amountCents: 8950, daysAgo: 24, reference: 'Running shoes' },
    ];
    for (const m of main) {
      await addTx({ cardId: mainCard, direction: m.direction || 'outbound', amountCents: m.amountCents, counterpartyName: m.merchant, reference: m.reference, category: m.category, daysAgo: m.daysAgo });
    }

    // Titanium card — travel & big-ticket
    const titanium = [
      { merchant: 'Lufthansa', category: 'travel', amountCents: 48900, daysAgo: 3, reference: 'Flight MUC → LIS' },
      { merchant: 'Booking.com', category: 'travel', amountCents: 76500, daysAgo: 3, reference: '3 nights · Lisbon' },
      { merchant: 'Nobu', category: 'food', amountCents: 18450, daysAgo: 5, reference: 'Dinner for two' },
      { merchant: 'Hertz', category: 'travel', amountCents: 21300, daysAgo: 8, reference: 'Car rental' },
      { merchant: 'Apple Store', category: 'shopping', amountCents: 134900, daysAgo: 15, reference: 'MacBook Air M4' },
      { merchant: 'The Ritz-Carlton', category: 'travel', amountCents: 89000, daysAgo: 22, reference: 'Weekend stay' },
      { merchant: 'Zara', category: 'shopping', amountCents: 15960, daysAgo: 27, reference: 'Jacket' },
    ];
    for (const m of titanium) {
      await addTx({ cardId: titaniumCard, direction: 'outbound', amountCents: m.amountCents, counterpartyName: m.merchant, reference: m.reference, category: m.category, daysAgo: m.daysAgo });
    }

    // Subscriptions card
    const subs = [
      { merchant: 'Spotify', amountCents: 1299, daysAgo: 0, reference: 'Premium plan' },
      { merchant: 'ChatGPT', amountCents: 2200, daysAgo: 1, reference: 'ChatGPT Plus' },
      { merchant: 'Netflix', amountCents: 1799, daysAgo: 3, reference: 'Standard plan' },
      { merchant: 'iCloud', amountCents: 299, daysAgo: 5, reference: 'iCloud+ 200GB' },
      { merchant: 'Notion', amountCents: 1000, daysAgo: 11, reference: 'Plus plan' },
      { merchant: 'YouTube Premium', amountCents: 1199, daysAgo: 14, reference: 'Monthly' },
      { merchant: 'Adobe', amountCents: 5999, daysAgo: 19, reference: 'Creative Cloud' },
      { merchant: 'GitHub', amountCents: 400, daysAgo: 21, reference: 'Pro plan' },
    ];
    for (const m of subs) {
      await addTx({ cardId: subsCard, direction: 'outbound', amountCents: m.amountCents, counterpartyName: m.merchant, reference: m.reference, category: 'subscription', daysAgo: m.daysAgo });
    }

    // A pending transaction for realism
    await addTx({ cardId: mainCard, direction: 'outbound', status: 'pending', amountCents: 2590, counterpartyName: 'Rewe', reference: 'Groceries', category: 'groceries', daysAgo: 0 });

    const txCount = await client.query('SELECT count(*)::int n FROM "transactions" WHERE "accountId"=$1', [accountId]);
    console.log(`Transactions created: ${txCount.rows[0].n}`);

    // --- Recipients ---
    const recipients = [
      { name: 'Anna Schmidt', iban: 'DE75512108001245126199', bic: 'SOGEDEFFXXX', bank: 'Société Générale', country: 'DE', email: 'anna.schmidt@example.com', isFavorite: true, notes: 'Flatmate' },
      { name: 'James Carter', iban: 'GB29NWBK60161331926819', bic: 'NWBKGB2L', bank: 'NatWest', country: 'GB', email: 'james@example.co.uk', isFavorite: true },
      { name: 'Lukas Müller', iban: 'DE21700519950000007229', bic: 'BYLADEM1KMS', bank: 'Sparkasse', country: 'DE', notes: 'Rent' },
      { name: 'Sophie Laurent', iban: 'FR1420041010050500013M02606', bic: 'PSSTFRPPXXX', bank: 'La Banque Postale', country: 'FR', email: 'sophie.laurent@example.fr' },
      { name: 'Auriga Savings', iban: 'DE02100110012620191901', bic: 'NTSBDEB1XXX', bank: 'N26', country: 'DE', notes: 'My savings pot' },
    ];
    for (const r of recipients) {
      await client.query(
        `INSERT INTO "recipients" ("userId","name","iban","bic","bank","country","email","notes","isFavorite")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [userId, r.name, r.iban, r.bic || null, r.bank || null, r.country || null, r.email || null, r.notes || null, r.isFavorite || false],
      );
    }
    console.log(`Recipients created: ${recipients.length}`);

    // --- Notifications ---
    const notifications = [
      { type: 'transaction', title: 'Payment sent', body: 'You sent €184.50 to Nobu.', read: false, daysAgo: 5 },
      { type: 'transaction', title: 'Money received', body: 'You received €6,150.00 from Auriga Capital GmbH.', read: false, daysAgo: 1 },
      { type: 'card', title: 'Card frozen', body: 'Your Travel card ending 1190 was frozen.', read: true, daysAgo: 9 },
      { type: 'security', title: 'New login', body: 'New sign-in from München, Germany.', read: true, daysAgo: 2 },
      { type: 'system', title: 'Welcome to Auriga', body: 'Your account is ready. Add money to get started.', read: true, daysAgo: 120 },
    ];
    for (const n of notifications) {
      await client.query(
        `INSERT INTO "notifications" ("userId","type","title","body","read","metadata","createdAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [userId, n.type, n.title, n.body, n.read, JSON.stringify({ seeded: true }), daysAgo(n.daysAgo)],
      );
    }
    console.log(`Notifications created: ${notifications.length}`);

    // --- Payment requests ---
    const paymentRequests = [
      { amountCents: 25000, note: 'Dinner at Nobu — your share', status: 'pending', token: 'pr_seed_dinner', recipientEmail: 'james@example.co.uk', expiresAt: daysAgo(-7) },
      { amountCents: 12000, note: 'Concert tickets', status: 'paid', token: 'pr_seed_concert', recipientEmail: 'anna.schmidt@example.com', paidAt: daysAgo(4), paidByName: 'Anna Schmidt' },
      { amountCents: 8000, note: 'Taxi split', status: 'expired', token: 'pr_seed_taxi' },
    ];
    for (const p of paymentRequests) {
      await client.query(
        `INSERT INTO "payment_requests" ("userId","amountCents","currency","recipientEmail","note","status","token","expiresAt","paidAt","paidByName")
         VALUES ($1,$2,'EUR',$3,$4,$5,$6,$7,$8,$9)`,
        [userId, p.amountCents, p.recipientEmail || null, p.note, p.status, p.token, p.expiresAt || null, p.paidAt || null, p.paidByName || null],
      );
    }
    console.log(`Payment requests created: ${paymentRequests.length}`);

    // --- Exchange rates (global, upsert-ish) ---
    const rates = [
      ['EUR', 'USD', 1.08],
      ['EUR', 'GBP', 0.85],
      ['USD', 'EUR', 0.92],
      ['GBP', 'EUR', 1.18],
    ];
    for (const [base, target, rate] of rates) {
      const exists = await client.query(
        'SELECT 1 FROM "exchange_rates" WHERE "baseCurrency"=$1 AND "targetCurrency"=$2 LIMIT 1',
        [base, target],
      );
      if (exists.rowCount === 0) {
        await client.query(
          'INSERT INTO "exchange_rates" ("baseCurrency","targetCurrency","rate") VALUES ($1,$2,$3)',
          [base, target, rate],
        );
      }
    }
    console.log('Exchange rates ensured');

    await client.query('COMMIT');
    console.log('\n✅ Seed complete for', EMAIL);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});

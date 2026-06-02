import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial schema. Hand-written to match the entity definitions so the DB has a
 * reproducible, versioned baseline (replacing synchronize:true).
 *
 * Notes:
 * - PII columns on `users` are stored as encrypted strings (see pii.transformer).
 * - `simple-json` TypeORM columns are stored as `text` in Postgres.
 */
export class InitialSchema1717300000000 implements MigrationInterface {
  name = 'InitialSchema1717300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
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
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "onboardings" (
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
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "accounts" (
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
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_accounts_userId" ON "accounts" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_accounts_user_currency" ON "accounts" ("userId", "currency")`);

    await queryRunner.query(`
      CREATE TABLE "cards" (
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
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_cards_accountId" ON "cards" ("accountId")`);

    await queryRunner.query(`
      CREATE TABLE "transactions" (
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
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_transactions_account_created" ON "transactions" ("accountId", "createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_transactions_card_created" ON "transactions" ("cardId", "createdAt")`);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_transactions_providerTxId" ON "transactions" ("providerTransactionId")`);

    await queryRunner.query(`
      CREATE TABLE "webhook_events" (
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
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_webhook_events_eventId" ON "webhook_events" ("providerEventId")`);

    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
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
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_audit_user_created" ON "audit_logs" ("userId", "createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_action_created" ON "audit_logs" ("action", "createdAt")`);

    await queryRunner.query(`
      CREATE TABLE "recipients" (
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
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_recipients_user_iban" ON "recipients" ("userId", "iban")`);

    await queryRunner.query(`
      CREATE TABLE "payment_requests" (
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
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_payment_requests_token_idx" ON "payment_requests" ("token")`);

    await queryRunner.query(`
      CREATE TABLE "exchange_rates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "baseCurrency" character varying NOT NULL,
        "targetCurrency" character varying NOT NULL,
        "rate" numeric(12,6) NOT NULL,
        "fetchedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_exchange_rates" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_exchange_rates_pair" ON "exchange_rates" ("baseCurrency", "targetCurrency")`);

    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "type" character varying NOT NULL,
        "title" character varying NOT NULL,
        "body" character varying NOT NULL,
        "read" boolean NOT NULL DEFAULT false,
        "metadata" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_user_created" ON "notifications" ("userId", "createdAt")`);

    await queryRunner.query(`ALTER TABLE "onboardings" ADD CONSTRAINT "FK_onboardings_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "accounts" ADD CONSTRAINT "FK_accounts_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "cards" ADD CONSTRAINT "FK_cards_account" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_transactions_account" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "recipients" ADD CONSTRAINT "FK_recipients_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "payment_requests" ADD CONSTRAINT "FK_payment_requests_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_notifications_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_notifications_user"`);
    await queryRunner.query(`ALTER TABLE "payment_requests" DROP CONSTRAINT "FK_payment_requests_user"`);
    await queryRunner.query(`ALTER TABLE "recipients" DROP CONSTRAINT "FK_recipients_user"`);
    await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_account"`);
    await queryRunner.query(`ALTER TABLE "cards" DROP CONSTRAINT "FK_cards_account"`);
    await queryRunner.query(`ALTER TABLE "accounts" DROP CONSTRAINT "FK_accounts_user"`);
    await queryRunner.query(`ALTER TABLE "onboardings" DROP CONSTRAINT "FK_onboardings_user"`);

    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TABLE "exchange_rates"`);
    await queryRunner.query(`DROP TABLE "payment_requests"`);
    await queryRunner.query(`DROP TABLE "recipients"`);
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TABLE "webhook_events"`);
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TABLE "cards"`);
    await queryRunner.query(`DROP TABLE "accounts"`);
    await queryRunner.query(`DROP TABLE "onboardings"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}

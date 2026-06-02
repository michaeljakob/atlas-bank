import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Persists user-controlled card preferences so they survive reloads and are
 * shared across devices: the design colour and the ATM / international payment
 * toggles (online + contactless toggles already exist). Sensible defaults match
 * the previous hard-coded UI state.
 */
export class AddColorToCards1717700000000 implements MigrationInterface {
  name = 'AddColorToCards1717700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cards" ADD COLUMN IF NOT EXISTS "color" character varying NOT NULL DEFAULT 'black'`,
    );
    await queryRunner.query(
      `ALTER TABLE "cards" ADD COLUMN IF NOT EXISTS "atmEnabled" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "cards" ADD COLUMN IF NOT EXISTS "internationalEnabled" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cards" DROP COLUMN IF EXISTS "internationalEnabled"`);
    await queryRunner.query(`ALTER TABLE "cards" DROP COLUMN IF EXISTS "atmEnabled"`);
    await queryRunner.query(`ALTER TABLE "cards" DROP COLUMN IF EXISTS "color"`);
  }
}

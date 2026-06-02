import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCardIdToTransactions1717000000000 implements MigrationInterface {
  name = 'AddCardIdToTransactions1717000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "cardId" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_transactions_cardId_createdAt" ON "transactions" ("cardId", "createdAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_transactions_cardId_createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN IF EXISTS "cardId"`,
    );
  }
}

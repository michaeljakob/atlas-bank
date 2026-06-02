import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds savings "jars": named pots scoped to a single currency that ring-fence
 * money away from the spendable balance of the matching currency hub account.
 */
export class AddJars1717600000000 implements MigrationInterface {
  name = 'AddJars1717600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "jars" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "name" character varying NOT NULL,
        "currency" character varying NOT NULL DEFAULT 'EUR',
        "balanceCents" bigint NOT NULL DEFAULT 0,
        "targetCents" bigint,
        "emoji" character varying,
        "color" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_jars" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_jars_user_currency" ON "jars" ("userId", "currency")`);
    await queryRunner.query(`ALTER TABLE "jars" ADD CONSTRAINT "FK_jars_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "jars" DROP CONSTRAINT "FK_jars_user"`);
    await queryRunner.query(`DROP INDEX "IDX_jars_user_currency"`);
    await queryRunner.query(`DROP TABLE "jars"`);
  }
}

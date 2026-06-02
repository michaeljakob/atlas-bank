import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the public payment `handle` to users so people can send/request money
 * by @handle instead of sharing an IBAN. Nullable + unique (Postgres allows
 * multiple NULLs under a unique index, so unclaimed users don't collide).
 */
export class AddHandleToUsers1717400000000 implements MigrationInterface {
  name = 'AddHandleToUsers1717400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "handle" character varying`);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_users_handle" ON "users" ("handle")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "UQ_users_handle"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "handle"`);
  }
}

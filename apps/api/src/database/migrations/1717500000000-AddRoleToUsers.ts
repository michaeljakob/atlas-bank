import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds a coarse access level to users. 'admin' unlocks the guarded /admin
 * endpoints; all existing and new users default to 'user'.
 */
export class AddRoleToUsers1717500000000 implements MigrationInterface {
  name = 'AddRoleToUsers1717500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" character varying NOT NULL DEFAULT 'user'`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_users_role" ON "users" ("role")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_role"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "role"`);
  }
}

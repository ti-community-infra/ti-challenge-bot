// eslint-disable-next-line no-unused-vars
import { MigrationInterface, QueryRunner } from 'typeorm'

export class ModifyChallengePullCharacterSet1600662929304 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table challenge_pulls default character set utf8mb4 collate utf8mb4_bin;')
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table challenge_pulls default character set latin1 collate latin1_swedish_ci;')
  }
}

// eslint-disable-next-line no-unused-vars
import { MigrationInterface, QueryRunner } from 'typeorm'

export class ChallengeProgramType1600592178540 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table challenge_programs add column type varchar(128) not null  default \'ALL\';')
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table challenge_programs drop column type;')
  }
}

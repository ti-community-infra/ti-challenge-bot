// eslint-disable-next-line no-unused-vars
import { MigrationInterface, QueryRunner } from 'typeorm'

export class ChallengeIssueRefactoringScoreAndMentor1599045421901 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table challenge_issues modify score int(11) null default null;')
    await queryRunner.query('alter table challenge_issues modify mentor varchar(255) null default null;')
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table challenge_issues modify score int(11) not null;')
    await queryRunner.query('alter table challenge_issues modify mentor varchar(255) not null;')
  }
}

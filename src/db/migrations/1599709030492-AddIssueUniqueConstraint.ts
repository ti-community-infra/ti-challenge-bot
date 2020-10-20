import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIssueUniqueConstraint1599709030492
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "alter table issues add constraint owner_repo_issue_number unique(owner,repo,issue_number)"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "alter table issues drop index owner_repo_issue_number;"
    );
  }
}

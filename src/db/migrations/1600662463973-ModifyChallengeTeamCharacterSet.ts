import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifyChallengeTeamCharacterSet1600662463973
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "alter table challenge_teams convert to character set utf8mb4 collate utf8mb4_bin;"
    );
    await queryRunner.query(
      "alter table challenge_teams default character set utf8mb4 collate utf8mb4_bin;"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "alter table challenge_teams convert to character set latin1 collate latin1_swedish_ci;"
    );
    await queryRunner.query(
      "alter table challenge_teams default character set latin1 collate latin1_swedish_ci;"
    );
  }
}

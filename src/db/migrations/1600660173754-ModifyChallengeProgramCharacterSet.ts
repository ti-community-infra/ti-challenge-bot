import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifyChallengeProgramCharacterSet1600660173754
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "alter table challenge_programs convert to character set utf8mb4 collate utf8mb4_bin;"
    );
    await queryRunner.query(
      "alter table challenge_programs default character set utf8mb4 collate utf8mb4_bin;"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "alter table challenge_programs convert to character set latin1 collate latin1_swedish_ci;"
    );
    await queryRunner.query(
      "alter table challenge_programs default character set latin1 collate latin1_swedish_ci;"
    );
  }
}

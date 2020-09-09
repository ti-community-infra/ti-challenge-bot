// eslint-disable-next-line no-unused-vars
import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class ChallengersChallengeTeams1599655975275 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'challengers_challenge_teams',
      columns: [
        {
          name: 'challenger_github_id',
          type: 'varchar(255)',
          isPrimary: true,
          isNullable: false
        },
        {
          name: 'challenge_team_id',
          type: 'int(11)',
          isPrimary: true,
          isNullable: false
        }
      ],
      foreignKeys: [
        {
          columnNames: ['challenger_github_id'],
          referencedTableName: 'challengers',
          referencedColumnNames: ['github_id'],
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        {
          columnNames: ['challenge_team_id'],
          referencedTableName: 'challenge_teams',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        }
      ]

    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('challengers_challenge_teams)')
  }
}

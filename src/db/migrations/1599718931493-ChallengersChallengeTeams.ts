// eslint-disable-next-line no-unused-vars
import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class ChallengersChallengeTeams1599718931493 implements MigrationInterface {
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
        },
        {
          name: 'created_at',
          type: 'timestamp',
          isNullable: false,
          default: 'now()'
        },
        {
          name: 'updated_at',
          type: 'timestamp',
          isNullable: false,
          default: 'now()'
        }
      ],
      foreignKeys: [
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

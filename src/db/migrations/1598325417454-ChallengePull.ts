import { MigrationInterface, QueryRunner, Table } from 'typeorm' // eslint-disable-line

export class ChallengePull1598325417454 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'challenge_pulls',
      columns: [
        {
          name: 'pull_id',
          type: 'int(11)',
          isPrimary: true,
          isNullable: false
        },
        {
          name: 'reward',
          type: 'int(11)',
          isNullable: false,
          default: 0
        },
        {
          name: 'challenge_issue_id',
          type: 'int(11)',
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
          columnNames: ['pull_id'],
          referencedTableName: 'pulls',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        {
          columnNames: ['challenge_issue_id'],
          referencedTableName: 'challenge_issues',
          referencedColumnNames: ['issue_id'],
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        }
      ]
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('challenge_pulls)')
  }
}

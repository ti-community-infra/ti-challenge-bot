import { MigrationInterface, QueryRunner, Table } from 'typeorm' // eslint-disable-line

export class ChallengeIssues1598324499976 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'challenge_issues',
      columns: [
        {
          name: 'issue_id',
          type: 'int(11)',
          isPrimary: true,
          isNullable: false
        },
        {
          name: 'sig_id',
          type: 'int(11)',
          isNullable: false
        },
        {
          name: 'score',
          type: 'int(11)',
          isNullable: false
        },
        {
          name: 'mentor',
          type: 'varchar(255)',
          isNullable: false
        },
        {
          name: 'has_picked',
          type: 'tinyint(1)',
          isNullable: false,
          default: 0
        },
        {
          name: 'current_challenger_github_id',
          type: 'varchar(255)',
          isNullable: true,
          default: null
        },
        {
          name: 'picked_at',
          type: 'timestamp',
          isNullable: true,
          default: null
        },
        {
          name: 'challenge_program_id',
          type: 'int(11)',
          isNullable: true,
          default: null
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
          columnNames: ['issue_id'],
          referencedTableName: 'issues',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        {
          columnNames: ['sig_id'],
          referencedTableName: 'sig',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        {
          columnNames: ['challenge_program_id'],
          referencedTableName: 'challenge_programs',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        }
      ]
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('challenge_issues)')
  }
}

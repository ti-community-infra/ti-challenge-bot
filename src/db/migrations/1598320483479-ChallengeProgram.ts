import { MigrationInterface, QueryRunner, Table } from 'typeorm' // eslint-disable-line

export class ChallengeProgram1598320483479 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'challenge_programs',
      columns: [
        {
          name: 'id',
          type: 'int(11)',
          isGenerated: true,
          isPrimary: true
        },
        {
          name: 'program_theme',
          type: 'varchar(255)',
          isUnique: true,
          isNullable: false
        }, {
          name: 'program_name',
          type: 'text',
          isNullable: true,
          default: null
        },
        {
          name: 'program_desc',
          type: 'text',
          isNullable: true,
          default: null
        },
        {
          name: 'begin_at',
          type: 'timestamp',
          isNullable: true,
          default: null
        },
        {
          name: 'end_at',
          type: 'timestamp',
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
      ]
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('challenge_programs)')
  }
}

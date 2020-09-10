import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class ChallengeTeam1599718819367 implements MigrationInterface {

    public async up (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'challenge_teams',
            columns: [
                {
                    name: 'id',
                    type: 'int(11)',
                    isGenerated: true,
                    generationStrategy: 'increment',
                    isPrimary: true
                },
                {
                    name: 'team_name',
                    type: 'varchar(255)',
                    isUnique: true,
                    isNullable: false
                }, {
                    name: 'team_desc',
                    type: 'text',
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
        await queryRunner.dropTable('challenge_teams)')
    }

}

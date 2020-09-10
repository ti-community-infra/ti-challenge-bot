import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class Challenger1599718881423 implements MigrationInterface {

    public async up (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'challengers',
            columns: [
                {
                    name: 'github_id',
                    type: 'varchar(255)',
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
            ]
        }))
    }

    public async down (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('challengers)')
    }

}

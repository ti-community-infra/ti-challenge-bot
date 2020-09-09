import {
  CreateDateColumn,
  Entity, PrimaryColumn, UpdateDateColumn
} from 'typeorm'

@Entity({ name: 'challengers' })
export class Challenger {
    @PrimaryColumn({ name: 'github_id', unique: true })
    githubId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

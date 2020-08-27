import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'challenge_pulls' })
export class ChallengePull {
    @PrimaryColumn({ name: 'pull_id', nullable: false })
    pullId: number;

    @Column({ name: 'reward', nullable: false, default: 0 })
    reward: number;

    @Column({ name: 'challenge_issue_id', nullable: false })
    challengeIssueId: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'update_at' })
    updatedAt: Date;
}

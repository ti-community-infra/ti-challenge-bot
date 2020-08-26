import { Entity, PrimaryColumn, JoinColumn, Column, CreateDateColumn, OneToOne, UpdateDateColumn } from 'typeorm'
import { Issues } from './Issues'

@Entity({ name: 'challenge_issues' })
export class ChallengeIssues {
    @PrimaryColumn({ name: 'issue_id', nullable: false })
    issueId: number;

    @Column({ name: 'sig_id', nullable: false })
    sigId: number;

    @Column({ name: 'score', nullable: false })
    score: number;

    @Column({ name: 'mentor', nullable: false })
    mentor: string;

    @Column({ name: 'has_picked', nullable: false, default: false })
    hasPicked: boolean;

    @Column({ name: 'current_challenger_github_id', nullable: true, default: null })
    currentChallengerGitHubId: string;

    @Column({ name: 'picked_at', nullable: true, default: null })
    pickedAt: Date;

    @Column({ name: 'challenge_program_id', nullable: true, default: null })
    challengeProgramId: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // @ts-ignore
    @OneToOne(type => Issues)
    @JoinColumn({ name: 'issue_id', referencedColumnName: 'id' })
    issue: Issues
}

import { Entity, PrimaryColumn, JoinColumn, Column, CreateDateColumn, OneToOne, UpdateDateColumn } from 'typeorm'
import { Issue } from './Issue'

@Entity({ name: 'challenge_issues' })
export class ChallengeIssue {
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

    @Column({ name: 'current_challenger_github_id', type: 'varchar', length: 255, nullable: true, default: null })
    currentChallengerGitHubId?: string | null;

    @Column({ name: 'picked_at', type: 'timestamp', nullable: true, default: null })
    pickedAt?: string | null;

    @Column({ name: 'challenge_program_id', nullable: true, default: null })
    challengeProgramId: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: string;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: string;

    // @ts-ignore
    @OneToOne(type => Issue, issue => issue.challengeIssue)
    @JoinColumn({ name: 'issue_id', referencedColumnName: 'id' })
    issue: Issue
}

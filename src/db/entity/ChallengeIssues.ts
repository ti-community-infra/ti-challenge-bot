import {Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn} from "typeorm";

@Entity({name: "challenge_issues"})
export class ChallengeIssues {
    @PrimaryColumn({name: "issue_id", nullable: false})
    issueId: number;

    @Column({name: "sig_id", nullable: false})
    sigId: number;

    @Column({name: "score", nullable: false})
    score: number;

    @Column({name: "mentor", nullable: false})
    mentor: string;

    @Column({name: "has_picked", nullable: false, default: false})
    hasPicked: boolean;

    @Column({name: "current_challenger_github_id", nullable: true, default: null})
    currentChallengerGitHubId: string;

    @Column({name: "picked_at", nullable: true, default: null})
    pickedAt: Date;

    @Column({name: "challenge_program_id", nullable: true, default: null})
    challengeProgramId: number;

    @CreateDateColumn({name: "created_at"})
    createdAt: Date;

    @UpdateDateColumn({name: "update_at"})
    updatedAt: Date;
}

import { CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'challengers_challenge_teams' })
export class ChallengeTeam {
    @PrimaryColumn({ name: 'challenger_github_id', nullable: false })
    challengerId: string;

    @PrimaryColumn({ name: 'challenge_team_id', nullable: false })
    challengeTeamId: number

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

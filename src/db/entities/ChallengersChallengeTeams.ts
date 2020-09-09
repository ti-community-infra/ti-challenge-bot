import { Entity, PrimaryColumn } from 'typeorm'

@Entity({ name: 'challengers_challenge_teams' })
export class ChallengeTeam {
    @PrimaryColumn({ name: 'challenger_github_id', nullable: false })
    challengerId: string;

    @PrimaryColumn({ name: 'challenge_team_id', nullable: false })
    challengeTeamId: number
}

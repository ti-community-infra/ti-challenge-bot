// eslint-disable-next-line no-unused-vars
import { ChallengeTeam } from '../../db/entities/ChallengeTeam'

export interface ChallengeProgramRankDTO{
    team?: ChallengeTeam,
    githubId?: string;
    score: number
}

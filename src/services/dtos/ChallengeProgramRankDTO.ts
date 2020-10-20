import { ChallengeTeam } from "../../db/entities/ChallengeTeam";

export interface ChallengeProgramRankDTO {
  team?: ChallengeTeam;
  githubId?: string;
  score: number;
}

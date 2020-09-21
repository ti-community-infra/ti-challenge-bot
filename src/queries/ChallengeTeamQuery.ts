export interface ChallengeTeamQuery{
    teamName: string;
    teamDesc?:string;
    challengeProgramId: number;
    leaderGithubId?: string;
    challengers:string[];
}

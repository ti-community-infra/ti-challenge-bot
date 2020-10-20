/* eslint-disable no-unused-vars */
export enum ChallengeTeamMessage {
  ProgramNotExist = "The challenge program not exist.",
  TeamNameAlreadyTaken = "The team name has been used.",
  Created = "Created success.",
}

export function challengersAlreadyHasTeam(challengers: string[]): string {
  return `The ${challengers.join(",")} already has a team.`;
}

import ChallengeTeamService from "../../services/challenge-team";
import { Request, Response } from "express";
import { ChallengeTeamQuery } from "../../queries/ChallengeTeamQuery";

const createTeam = async (
  req: Request,
  res: Response,
  challengeTeamService: ChallengeTeamService
) => {
  const challengeTeamQuery = <ChallengeTeamQuery>req.body;

  const response = await challengeTeamService.create(challengeTeamQuery);

  res.status(response.status);
  res.json(response);
};
export default createTeam;

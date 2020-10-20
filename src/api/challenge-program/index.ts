import { Request, Response } from "express";
import ChallengeProgramService from "../../services/challenge-program";
import { RankQuery } from "../../queries/RankQuery";

const findAllChallengePrograms = async (
  _req: Request,
  res: Response,
  challengeProgramService: ChallengeProgramService
) => {
  const response = await challengeProgramService.findAll();

  res.status(response.status);
  res.json(response);
};

const ranking = async (
  req: Request,
  res: Response,
  challengeProgramService: ChallengeProgramService
) => {
  const rankQuery: RankQuery = {
    challengeProgramId: Number(req.params.id),
    byTeam: req.query.byTeam !== "false",
  };

  const response = await challengeProgramService.ranking(rankQuery);

  res.status(response.status);
  res.json(response);
};

export { findAllChallengePrograms, ranking };

import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";

import { Repository } from "typeorm";
import { ChallengeProgram } from "../../db/entities/ChallengeProgram";

import { Response } from "../response";
import { StatusCodes } from "http-status-codes";

import { ChallengeProgramRankDTO } from "../dtos/ChallengeProgramRankDTO";

import { RankQuery } from "../../queries/RankQuery";
import { ChallengeTeam } from "../../db/entities/ChallengeTeam";

import ScoreRepository from "../../repositoies/score";
import { ChallengersChallengeTeams } from "../../db/entities/ChallengersChallengeTeams";
import { ChallengeProgramMessage } from "../messages/ChallengeProgramMessage";

@Service()
export default class ChallengeProgramService {
  constructor(
    @InjectRepository(ChallengeProgram)
    private challengeProgramRepository: Repository<ChallengeProgram>,
    @InjectRepository(ChallengeTeam)
    private challengeTeamRepository: Repository<ChallengeTeam>,
    @InjectRepository(ChallengersChallengeTeams)
    private challengersChallengeTeamsRepository: Repository<
      ChallengersChallengeTeams
    >,
    @InjectRepository()
    private scoreRepository: ScoreRepository
  ) {}

  public async findAll(): Promise<Response<ChallengeProgram[]>> {
    const programs = await this.challengeProgramRepository.find();

    return {
      data: programs,
      status: StatusCodes.OK,
      message: ChallengeProgramMessage.AllPrograms,
    };
  }

  /**
   * Get rank by team.
   * @param challengeProgramId
   * @private
   */
  private async rankingByTeam(
    challengeProgramId: number
  ): Promise<ChallengeProgramRankDTO[] | null> {
    const program = await this.challengeProgramRepository.findOne({
      where: {
        id: challengeProgramId,
      },
    });

    if (program === undefined) {
      return null;
    }

    const teams = await this.challengeTeamRepository.find({
      where: {
        challengeProgramId: program.id,
      },
    });
    const result: ChallengeProgramRankDTO[] = [];

    for (let i = 0; i < teams.length; i++) {
      const teamMembers = await this.challengersChallengeTeamsRepository.find({
        where: {
          challengeTeamId: teams[i].id,
        },
      });
      let totalScore = 0;
      for (let j = 0; j < teamMembers.length; j++) {
        totalScore += await this.scoreRepository.getCurrentScoreInProgram(
          program.programTheme,
          teamMembers[j].challengerGithubId
        );
      }

      result.push({
        team: teams[i],
        score: totalScore,
      });
    }

    return result;
  }

  /**
   * Get rank by github name.
   * @param challengeProgramId
   * @private
   */
  private async rankingByGithubName(
    challengeProgramId: number
  ): Promise<ChallengeProgramRankDTO[] | null> {
    const program = await this.challengeProgramRepository.findOne({
      where: {
        id: challengeProgramId,
      },
    });

    if (program === undefined) {
      return null;
    }

    const scoreWithGithubNames = await this.scoreRepository.getCurrentScoreInProgram(
      program.programTheme
    );

    return scoreWithGithubNames.map((s) => {
      return {
        ...s,
      };
    });
  }

  /**
   * Get program ranks.
   * @param rankQuery
   */
  public async ranking(
    rankQuery: RankQuery
  ): Promise<Response<ChallengeProgramRankDTO[] | null>> {
    let ranks;

    if (rankQuery.byTeam) {
      ranks = await this.rankingByTeam(rankQuery.challengeProgramId);
    } else {
      ranks = await this.rankingByGithubName(rankQuery.challengeProgramId);
    }

    if (ranks === null) {
      return {
        data: null,
        status: StatusCodes.NOT_FOUND,
        message: ChallengeProgramMessage.ProgramNotExist,
      };
    }

    // Order by score.
    return {
      data: ranks.sort(function (a, b) {
        return a.score - b.score;
      }),
      status: StatusCodes.OK,
      message: ChallengeProgramMessage.AllRanks,
    };
  }
}

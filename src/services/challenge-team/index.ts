import { Service } from "typedi";

import { ChallengeTeamQuery } from "../../queries/ChallengeTeamQuery";
import { InjectRepository } from "typeorm-typedi-extensions";

import { ChallengeTeam } from "../../db/entities/ChallengeTeam";

import { Repository } from "typeorm";

import { Response } from "../response";
import { StatusCodes } from "http-status-codes";
import { ChallengeProgram } from "../../db/entities/ChallengeProgram";
import { ChallengersChallengeTeams } from "../../db/entities/ChallengersChallengeTeams";
import {
  challengersAlreadyHasTeam,
  ChallengeTeamMessage,
} from "../messages/ChallengeTeamMessage";

@Service()
export default class ChallengeTeamService {
  constructor(
    @InjectRepository(ChallengeTeam)
    private challengeTeamRepository: Repository<ChallengeTeam>,
    @InjectRepository(ChallengeProgram)
    private challengeProgramRepository: Repository<ChallengeProgram>,
    @InjectRepository(ChallengersChallengeTeams)
    private challengersChallengeTeamsRepository: Repository<
      ChallengersChallengeTeams
    >
  ) {}

  /**
   * Get challengers who have joined another team.
   * @param challengers
   * @param challengeProgramId
   * @private
   */
  private async getChallengersInAnotherTeam(
    challengers: string[],
    challengeProgramId: number
  ): Promise<string[]> {
    const currentChallengers = (
      await this.challengeProgramRepository
        .createQueryBuilder("cpg")
        .where(`cpg.id = ${challengeProgramId}`)
        .leftJoinAndSelect(
          ChallengeTeam,
          "ct",
          "cpg.id = ct.challenge_program_id"
        )
        .leftJoinAndSelect(
          ChallengersChallengeTeams,
          "cct",
          "ct.id = cct.challenge_team_id"
        )
        .select("cct.challenger_github_id", "challengerGithubId")
        .getRawMany()
    ).map((c) => {
      return c.challengerGithubId;
    });

    return challengers.filter((c) => {
      return currentChallengers.includes(c);
    });
  }

  /**
   * Create a team.
   * TODO: we should clarify when to use undefined or null.
   * @param challengeTeamQuery
   */
  public async create(
    challengeTeamQuery: ChallengeTeamQuery
  ): Promise<Response<ChallengeTeam | null>> {
    const program = await this.challengeProgramRepository.findOne({
      where: {
        id: challengeTeamQuery.challengeProgramId,
      },
    });
    if (program === undefined) {
      return {
        data: null,
        status: StatusCodes.BAD_REQUEST,
        message: ChallengeTeamMessage.ProgramNotExist,
      };
    }

    const team = await this.challengeTeamRepository.findOne({
      where: {
        challengeProgramId: challengeTeamQuery.challengeProgramId,
        teamName: challengeTeamQuery.teamName,
      },
    });
    // Notice: can not have same team name in one program.
    if (team !== undefined) {
      return {
        data: null,
        status: StatusCodes.BAD_REQUEST,
        message: ChallengeTeamMessage.TeamNameAlreadyTaken,
      };
    }

    const { challengers } = challengeTeamQuery;
    const alreadyTeamedChallengers = await this.getChallengersInAnotherTeam(
      challengers,
      program.id
    );
    if (alreadyTeamedChallengers.length > 0) {
      return {
        data: null,
        status: StatusCodes.BAD_REQUEST,
        message: challengersAlreadyHasTeam(alreadyTeamedChallengers),
      };
    }

    let newTeam = new ChallengeTeam();
    newTeam.teamName = challengeTeamQuery.teamName;
    newTeam.teamDesc = challengeTeamQuery.teamDesc;
    newTeam.leaderGithubId = challengeTeamQuery.leaderGithubId;
    newTeam.challengeProgramId = program.id;

    newTeam = await this.challengeTeamRepository.save(newTeam);

    const challengersChallengeTeams: ChallengersChallengeTeams[] = challengers.map(
      (c) => {
        const temp = new ChallengersChallengeTeams();
        temp.challengerGithubId = c;
        temp.challengeTeamId = newTeam.id;
        return temp;
      }
    );

    await this.challengersChallengeTeamsRepository.save(
      challengersChallengeTeams
    );

    return {
      data: newTeam,
      status: StatusCodes.CREATED,
      message: ChallengeTeamMessage.Created,
    };
  }
}

import { EntityRepository } from "typeorm";
import { Service } from "typedi";
import { ChallengeIssue } from "../../db/entities/ChallengeIssue";
import { ChallengeProgram } from "../../db/entities/ChallengeProgram";
import { ChallengePull } from "../../db/entities/ChallengePull";
import { Pull } from "../../db/entities/Pull";

import { Repository } from "typeorm/repository/Repository";

/**
 * Issue or Pull request status.
 */
export enum IssueOrPullStatus {
  Open = "open",

  Closed = "closed",

  Merged = "merged",
}

/**
 * Score with github name.
 */
export interface ScoreWithGithubName {
  githubName: string;
  score: number;
}

@Service()
@EntityRepository(ChallengeIssue)
export default class ScoreRepository extends Repository<ChallengeIssue> {
  /**
   * Get current score in program.
   * @param theme Challenge program theme.
   */
  public async getCurrentScoreInProgram(
    theme: string
  ): Promise<ScoreWithGithubName[]>;
  /**
   * Get current score in program.
   * @param theme Challenge program theme.
   * @param username Github username.
   */
  public async getCurrentScoreInProgram(
    theme: string,
    username: string
  ): Promise<number>;
  public async getCurrentScoreInProgram(theme: string, username?: string) {
    if (username !== undefined) {
      // TODO: we should try to optimize all sql in the entire project.
      const { score } = await this.createQueryBuilder("ci")
        .leftJoinAndSelect(
          ChallengeProgram,
          "cpg",
          "ci.challenge_program_id = cpg.id"
        )
        .leftJoinAndSelect(
          ChallengePull,
          "cp",
          "ci.issue_id = cp.challenge_issue_id"
        )
        .leftJoinAndSelect(Pull, "p", "cp.pull_id = p.id")
        .where(
          `cpg.program_theme = '${theme}' and p.user = '${username}' and p.status = '${IssueOrPullStatus.Merged}'`
        )
        .select("sum(cp.reward)", "score")
        .getRawOne();

      return score;
    }

    // Without github name.
    return (
      await this.createQueryBuilder("ci")
        .leftJoinAndSelect(
          ChallengeProgram,
          "cpg",
          "ci.challenge_program_id = cpg.id"
        )
        .leftJoinAndSelect(
          ChallengePull,
          "cp",
          " ci.issue_id = cp.challenge_issue_id"
        )
        .leftJoinAndSelect(Pull, "p", "cp.pull_id = p.id")
        .where(
          `cpg.program_theme = '${theme}' and p.status = '${IssueOrPullStatus.Merged}'`
        )
        .groupBy("p.user")
        .select("p.user as githubName, sum(cp.reward) as score")
        .getRawMany()
    ).map((r) => {
      return {
        ...r,
      };
    });
  }

  /**
   * Get current challenge program issue left score.
   * @param issueId
   * @param pullId
   */
  public async getCurrentIssueLeftScore(
    issueId: number,
    pullId: number
  ): Promise<number | undefined> {
    const challengeIssue = await this.findOne({
      relations: ["challengePulls"],
      where: {
        issueId,
      },
    });
    if (
      challengeIssue === undefined ||
      challengeIssue.score === undefined ||
      challengeIssue.score === null
    ) {
      return;
    }

    const { challengePulls } = challengeIssue;

    if (
      challengePulls === undefined ||
      challengePulls === null ||
      challengePulls.length === 0
    ) {
      return challengeIssue.score;
    } else {
      return (
        challengeIssue.score -
        challengePulls
          .filter((c) => {
            return c.pullId !== pullId;
          })
          .map((c) => {
            return c.reward;
          })
          .reduce((total, currentNum) => {
            return total + currentNum;
          }, 0)
      );
    }
  }
}

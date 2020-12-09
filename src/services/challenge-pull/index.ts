import { Service, Token } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Issue } from "../../db/entities/Issue";

import { Repository } from "typeorm/repository/Repository";
import { ChallengePull } from "../../db/entities/ChallengePull";
import { Pull } from "../../db/entities/Pull";

import ScoreRepository, { IssueOrPullStatus } from "../../repositoies/score";

import { RewardQuery } from "../../queries/RewardQuery";

import { LabelQuery } from "../../queries/LabelQuery";

import { Reply, Status } from "../reply";
import {
  ChallengePullMessage,
  ChallengePullTips,
  countScoreMessage,
  lgtmNotReward,
  pullMergedButNotPickedWarning,
  rewardNotEnoughLeftScoreMessage,
  rewardScoreInvalidWarning,
} from "../messages/ChallengePullMessage";
import { findLinkedIssueNumber } from "../utils/PullUtil";

import { PullPayload } from "../../events/payloads/PullPayload";

import { ChallengePullQuery } from "../../queries/ChallengePullQuery";
import { ChallengeIssueTip } from "../messages/ChallengeIssueMessage";
import { checkIsInAssignFlow } from "../utils/IssueUtil";

export interface IChallengePullService {
  reward(rewardQuery: RewardQuery): Promise<Reply<null>>;
  countScoreWhenPullClosed(
    pullPayload: PullPayload
  ): Promise<Reply<number | null> | undefined>;
  checkHasRewardToChallengePull(
    challengePullQuery: ChallengePullQuery
  ): Promise<Reply<null> | null>;
}

export const IChallengePullServiceToken = new Token<IChallengePullService>();

@Service(IChallengePullServiceToken)
export default class ChallengePullService implements IChallengePullService {
  constructor(
    @InjectRepository(Issue)
    private issueRepository: Repository<Issue>,
    @InjectRepository(ChallengePull)
    private challengePullRepository: Repository<ChallengePull>,
    @InjectRepository(Pull)
    private pullRepository: Repository<Pull>,
    @InjectRepository()
    private scoreRepository: ScoreRepository
  ) {}

  private async findOrCreatePull(
    query: RewardQuery | ChallengePullQuery
  ): Promise<Pull> {
    const { pull: pullQuery } = query;

    let pull = await this.pullRepository.findOne({
      relations: ["challengePull"],
      where: {
        pullNumber: pullQuery.number,
      },
    });

    if (pull === undefined) {
      const newPull = new Pull();
      newPull.owner = query.owner;
      newPull.repo = query.repo;
      newPull.pullNumber = pullQuery.number;
      newPull.title = pullQuery.title;
      newPull.body = pullQuery.body;
      newPull.user = pullQuery.user.login;
      // FIXME: add relations.
      newPull.association = pullQuery.authorAssociation;
      newPull.label = pullQuery.labels
        .map((l: LabelQuery) => {
          return l.name;
        })
        .join(",");
      newPull.status = pullQuery.state;
      newPull.updatedAt = pullQuery.updatedAt;
      newPull.closedAt = pullQuery.closedAt;
      pull = await this.pullRepository.save(newPull);
    }

    return pull;
  }

  /**
   * Reward score to the PR.
   * @param rewardQuery
   */
  public async reward(rewardQuery: RewardQuery): Promise<Reply<null>> {
    const baseFailedMessage = {
      data: null,
      status: Status.Failed,
    };

    // Try to find linked issue.
    const issue = await this.issueRepository.findOne({
      relations: ["challengeIssue"],
      where: {
        issueNumber: rewardQuery.linkedIssueNumber,
      },
    });

    if (
      issue === undefined ||
      issue.challengeIssue === undefined ||
      issue.challengeIssue === null
    ) {
      return {
        ...baseFailedMessage,
        message: ChallengePullMessage.LinkedNotChallengeIssue,
      };
    }

    const { challengeIssue } = issue;

    // Check the challenge issue's mentor.
    if (challengeIssue.mentor === undefined || challengeIssue.mentor === null) {
      return {
        data: null,
        status: Status.Problematic,
        message: ChallengePullMessage.LinkedIssueMissMentorInfo,
        tip: ChallengeIssueTip.RefineIssueFormat,
      };
    }

    // Check if the mentor match.
    if (rewardQuery.mentor !== challengeIssue.mentor) {
      return {
        ...baseFailedMessage,
        message: ChallengePullMessage.NotMentor,
      };
    }

    let needCheckHasPicked = false;

    const isInAssignFlow = checkIsInAssignFlow(
      rewardQuery.issueAssignees,
      challengeIssue.mentor
    );
    if (!isInAssignFlow) {
      // Check if the issue has picked.
      needCheckHasPicked = true;
    }

    if (needCheckHasPicked && !challengeIssue.hasPicked) {
      return {
        ...baseFailedMessage,
        message: ChallengePullMessage.NotPicked,
      };
    }

    // Check the challenge issue's score.
    if (challengeIssue.score === null || challengeIssue.score === undefined) {
      return {
        ...baseFailedMessage,
        message: ChallengePullMessage.LinkedIssueMissScoreInfo,
      };
    }

    // Check if the reward score valid.
    if (rewardQuery.reward <= 0 || rewardQuery.reward > challengeIssue.score) {
      return {
        data: null,
        status: Status.Problematic,
        message: ChallengePullMessage.NotValidReward,
        warning: rewardScoreInvalidWarning(
          rewardQuery.reward,
          challengeIssue.score
        ),
      };
    }

    // Check the left score.
    const pull = await this.findOrCreatePull(rewardQuery);
    const currentLeftScore = await this.scoreRepository.getCurrentIssueLeftScore(
      challengeIssue.issueId,
      pull.id
    );
    if (currentLeftScore === undefined) {
      return {
        ...baseFailedMessage,
        message: ChallengePullMessage.LinkedIssueMissScoreInfo,
      };
    }

    if (rewardQuery.reward > currentLeftScore) {
      return {
        ...baseFailedMessage,
        message: rewardNotEnoughLeftScoreMessage(currentLeftScore),
      };
    }

    const { challengePull } = pull;
    if (challengePull === undefined || challengePull === null) {
      const newChallengeIssue = new ChallengePull();
      newChallengeIssue.pullId = pull.id;
      newChallengeIssue.reward = rewardQuery.reward;
      newChallengeIssue.challengeIssueId = challengeIssue.issueId;
      await this.challengePullRepository.save(newChallengeIssue);
    } else {
      challengePull.reward = rewardQuery.reward;
      await this.challengePullRepository.save(challengePull);
    }

    return {
      data: null,
      status: Status.Success,
      message: ChallengePullMessage.RewardSuccess,
    };
  }

  /**
   * Count the challenger score when the PR closed
   * @param pullPayload
   */
  public async countScoreWhenPullClosed(
    pullPayload: PullPayload
  ): Promise<Reply<number | null> | undefined> {
    const { pull: pullQuery } = pullPayload;

    const pull = await this.pullRepository.findOne({
      relations: ["challengePull"],
      where: {
        pullNumber: pullPayload.number,
      },
    });

    // Can not find the pull it means this pull request not reward, so we do not need to count this.
    if (
      pull === undefined ||
      pull.challengePull === undefined ||
      pull.challengePull === null
    ) {
      return;
    }

    // Can not find linked issue.
    const issueNumber = findLinkedIssueNumber(pullQuery.body);
    if (issueNumber === null) {
      return;
    }

    // Can not find issue or challenge issue info.
    const issue = await this.issueRepository.findOne({
      relations: ["challengeIssue", "challengeIssue.challengeProgram"],
      where: {
        issueNumber,
      },
    });

    if (
      issue === undefined ||
      issue.challengeIssue === undefined ||
      issue.challengeIssue === null
    ) {
      return;
    }

    // Not picked.
    const { login: username } = pullQuery.user;
    const { challengeIssue } = issue;
    let warning;
    if (!challengeIssue.hasPicked) {
      warning = pullMergedButNotPickedWarning(
        username,
        challengeIssue.mentor,
        challengeIssue.currentChallengerGitHubId
      );
    }

    // Update pull info.
    pull.title = pullQuery.title;
    pull.body = pullQuery.body;
    pull.label = pullQuery.labels
      .map((l: LabelQuery) => {
        return l.name;
      })
      .join(",");
    pull.status = IssueOrPullStatus.Merged;
    pull.updatedAt = pullQuery.updatedAt;
    pull.closedAt = pullQuery.closedAt;
    pull.mergedAt = pullQuery.mergedAt;
    await this.pullRepository.save(pull);

    // Count the score.
    const { challengeProgram } = challengeIssue;

    const score = await this.scoreRepository.getCurrentScoreInProgram(
      challengeProgram.programTheme,
      username
    );
    if (warning !== undefined) {
      return {
        data: score,
        status: Status.Problematic,
        message: countScoreMessage(
          username,
          pull.challengePull.reward,
          score,
          challengeProgram.programTheme
        ),
        warning,
      };
    }
    return {
      data: score,
      status: Status.Success,
      message: countScoreMessage(
        username,
        pull.challengePull.reward,
        score,
        challengeProgram.programTheme
      ),
    };
  }

  /**
   * Check if reward to challenge pull.
   * TODO: we should add a pull service.
   * @param challengePullQuery
   */
  public async checkHasRewardToChallengePull(
    challengePullQuery: ChallengePullQuery
  ): Promise<Reply<null> | null> {
    const { pull: pullQuery } = challengePullQuery;
    let pull = await this.pullRepository.findOne({
      relations: ["challengePull"],
      where: {
        pullNumber: pullQuery.number,
      },
    });

    // FIXME: should we add it?
    if (pull === undefined) {
      pull = await this.findOrCreatePull(challengePullQuery);
    }

    // Try to find linked issue number.
    const issueNumber = findLinkedIssueNumber(pullQuery.body);
    if (issueNumber === null) {
      return null;
    }

    // Try to find linked issue.
    const issue = await this.issueRepository.findOne({
      relations: ["challengeIssue"],
      where: {
        issueNumber,
      },
    });
    // Not a challenge issue.
    if (
      issue === undefined ||
      issue.challengeIssue === undefined ||
      issue.challengeIssue === null
    ) {
      return null;
    }

    // Cannot find challenge pull means not reward.
    // Because if rewarded, it will create challenge pull.
    if (pull.challengePull === undefined || pull.challengePull === null) {
      return {
        data: null,
        status: Status.Problematic,
        message: issue.challengeIssue.mentor
          ? lgtmNotReward(issue.challengeIssue.mentor)
          : lgtmNotReward(),
        tip: ChallengePullTips.RewardCommandRefs,
      };
    }

    return {
      data: null,
      status: Status.Success,
      message: ChallengePullMessage.Rewarded,
    };
  }
}

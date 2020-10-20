import { Context } from "probot";

import { RewardQuery } from "../../queries/RewardQuery";

import { LabelQuery } from "../../queries/LabelQuery";
import { Status } from "../../services/reply";
import { REWARDED_LABEL } from "../labels";

import ChallengePullService from "../../services/challenge-pull";
import { combineReplay } from "../../services/utils/ReplyUtil";
import { findLinkedIssueNumber } from "../../services/utils/PullUtil";
import {
  ChallengePullMessage,
  ChallengePullTips,
} from "../../services/messages/ChallengePullMessage";
import { UserQuery } from "../../queries/UserQuery";

/**
 * Reward score to the PR.
 * @param context
 * @param score
 * @param challengePullService
 */
const reward = async (
  context: Context,
  score: number,
  challengePullService: ChallengePullService
) => {
  // Notice: because the context come form issue_comment.created, so we need to get the pull.
  const pullResponse = await context.github.pulls.get(context.issue());
  const { data } = pullResponse;
  const { sender } = context.payload;
  const labels: LabelQuery[] = data.labels.map((label) => {
    return {
      ...label,
    };
  });
  const issue = context.issue();
  const { user } = data;

  // Find linked issue assignees.
  const issueNumber = findLinkedIssueNumber(data.body);

  if (issueNumber === undefined) {
    await context.github.issues.createComment(
      context.issue({
        body: combineReplay({
          data: null,
          status: Status.Problematic,
          message: ChallengePullMessage.CanNotFindLinkedIssue,
          tip: ChallengePullTips.CanNotFindLinkedIssue,
        }),
      })
    );
    return;
  }

  const { data: issueData } = await context.github.issues.get({
    ...context.repo(),
    issue_number: issueNumber,
  });

  const issueAssignees = issueData.assignees.map((a: UserQuery) => {
    return { ...a };
  });

  const rewardQuery: RewardQuery = {
    mentor: sender.login,
    ...issue,
    pull: {
      ...data,
      user: {
        ...user,
      },
      labels: labels,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      closedAt: data.closed_at,
      mergedAt: data.merged_at,
      authorAssociation: data.author_association,
    },
    reward: score,
    issueAssignees,
    linkedIssueNumber: issueNumber,
  };

  const reply = await challengePullService.reward(rewardQuery);

  switch (reply.status) {
    case Status.Failed: {
      context.log.error(
        `Reward ${rewardQuery} failed because ${reply.message}.`
      );
      await context.github.issues.createComment(
        context.issue({ body: reply.message })
      );
      break;
    }
    case Status.Success: {
      // Add rewarded label.
      context.log.info(`Reward ${rewardQuery} success.`);
      await context.github.issues.addLabels(
        context.issue({ labels: [REWARDED_LABEL] })
      );
      await context.github.issues.createComment(
        context.issue({ body: reply.message })
      );
      break;
    }
    case Status.Problematic: {
      context.log.info(`Reward ${rewardQuery} has some problems.`);
      await context.github.issues.createComment(
        context.issue({ body: combineReplay(reply) })
      );
      break;
    }
  }
};

export default reward;

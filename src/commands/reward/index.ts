import { Context } from "probot";
import { EventPayloads } from "@octokit/webhooks";

import { RewardQuery } from "../../queries/RewardQuery";
import { LabelQuery } from "../../queries/LabelQuery";
import { Status } from "../../services/reply";
import { REWARDED_LABEL } from "../labels";
import { IChallengePullService } from "../../services/challenge-pull";
import { combineReplay } from "../../services/utils/ReplyUtil";
import {
  findLinkedIssueNumber,
  isValidBranch,
} from "../../services/utils/PullUtil";
import {
  ChallengePullMessage,
  ChallengePullTips,
} from "../../services/messages/ChallengePullMessage";

import {
  Config,
  DEFAULT_BRANCHES,
  DEFAULT_CONFIG_FILE_PATH,
} from "../../config/Config";

/**
 * Reward score to the PR.
 * @param context
 * @param score
 * @param challengePullService
 */
const reward = async (
  context: Context<EventPayloads.WebhookPayloadIssueComment>,
  score: number,
  challengePullService: IChallengePullService
) => {
  const pullKey = context.pullRequest();
  const { owner, repo, pull_number: pullNumber } = pullKey;
  const pullSignature = `${owner}/${repo}#${pullNumber}`;

  // Notice: because the context come form issue_comment.created, so we need to get the pull.
  let pullResponse = null;

  try {
    pullResponse = await context.octokit.pulls.get(pullKey);
  } catch (err) {
    context.log.error(
      err,
      `Reward pull request ${pullSignature} failed because fail to get the pull request, maybe it is an issue.`
    );
    return;
  }

  const { data: pullRequest } = pullResponse;
  const { sender } = context.payload;
  const labels: LabelQuery[] = pullRequest.labels.map((label) => {
    return {
      ...label,
    };
  });
  const { user } = pullRequest;

  const config = await context.config<Config>(DEFAULT_CONFIG_FILE_PATH, {
    branches: DEFAULT_BRANCHES,
  });
  if (!isValidBranch(config!.branches!, pullRequest.base.ref)) {
    return;
  }

  // Find linked issue assignees.
  const linkedIssueNumber = findLinkedIssueNumber(pullRequest.body);

  if (linkedIssueNumber === null) {
    await context.octokit.issues.createComment(
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

  const { data: issue } = await context.octokit.issues.get(
    context.repo({
      issue_number: linkedIssueNumber,
    })
  );

  const issueAssignees = (issue.assignees || []).map((assignee) => {
    return {
      ...(assignee as any),
    };
  });

  const rewardQuery: RewardQuery = {
    mentor: sender.login,
    owner: owner,
    repo: repo,
    pull: {
      ...pullRequest,
      user: user,
      labels: labels,
      createdAt: pullRequest.created_at,
      updatedAt: pullRequest.updated_at,
      closedAt: pullRequest.closed_at,
      mergedAt: pullRequest.merged_at,
      authorAssociation: pullRequest.author_association,
    },
    reward: score,
    issueAssignees,
    linkedIssueNumber: linkedIssueNumber,
  };

  const reply = await challengePullService.reward(rewardQuery);

  switch (reply.status) {
    case Status.Failed: {
      context.log.error(
        rewardQuery,
        `Reward ${pullSignature} failed because ${reply.message}.`
      );
      await context.octokit.issues.createComment(
        context.issue({ body: reply.message })
      );
      break;
    }
    case Status.Success: {
      // Add rewarded label.
      context.log.info(rewardQuery, `Reward ${pullSignature} success.`);
      await context.octokit.issues.addLabels(
        context.issue({ labels: [REWARDED_LABEL] })
      );
      await context.octokit.issues.createComment(
        context.issue({ body: reply.message })
      );
      break;
    }
    case Status.Problematic: {
      context.log.info(
        rewardQuery,
        `Reward ${pullSignature} has some problems.`
      );
      await context.octokit.issues.createComment(
        context.issue({ body: combineReplay(reply) })
      );
      break;
    }
  }
};

export default reward;

import { Context } from "probot";
import { EventPayloads } from "@octokit/webhooks";

import { LabelQuery } from "../../queries/LabelQuery";
import { ChallengePullQuery } from "../../queries/ChallengePullQuery";

import { Status } from "../../services/reply";
import ChallengePullService from "../../services/challenge-pull";
import { combineReplay } from "../../services/utils/ReplyUtil";
import { isValidBranch } from "../../services/utils/PullUtil";

import {
  Config,
  DEFAULT_BRANCHES,
  DEFAULT_CONFIG_FILE_PATH,
} from "../../config/Config";

/**
 * Handle LGTM custom event.
 * When we got a lgtm, we need check if challenge pull rewarded.
 * @param context
 * @param challengePullService
 */
const handleLgtm = async (
  context: Context<EventPayloads.WebhookPayloadIssueComment>,
  challengePullService: ChallengePullService
) => {
  const { owner, repo, issue_number: issueNumber } = context.issue();
  const pullResponse = await context.octokit.pulls.get({
    owner,
    repo,
    pull_number: issueNumber,
  });
  const { data } = pullResponse;
  const labels: LabelQuery[] = data.labels.map((label) => {
    return {
      ...label,
    };
  });
  const { user } = data;

  const challengePullQuery: ChallengePullQuery = {
    owner,
    repo,
    pull: {
      ...data,
      user: user,
      labels: labels,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      closedAt: data.closed_at,
      mergedAt: data.merged_at,
      authorAssociation: data.author_association,
    },
  };

  const config = await context.config<Config>(DEFAULT_CONFIG_FILE_PATH, {
    branches: DEFAULT_BRANCHES,
  });
  if (!isValidBranch(config!.branches!, data.base.ref)) {
    return;
  }

  const reply = await challengePullService.checkHasRewardToChallengePull(
    challengePullQuery
  );

  // It means not a challenge pull.
  if (reply === null) {
    return;
  }

  switch (reply.status) {
    case Status.Success: {
      // Do nothing, if already rewarded.
      return;
    }
    case Status.Problematic: {
      await context.octokit.issues.createComment(
        context.issue({ body: combineReplay(reply) })
      );
      break;
    }
  }
};
export { handleLgtm };

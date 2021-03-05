import { Context } from "probot";
import { EventPayloads } from "@octokit/webhooks";

import ChallengePullService from "../../services/challenge-pull";
import { combineReplay } from "../../services/utils/ReplyUtil";
import { Status } from "../../services/reply";
import { IssueOrPullActions } from "../issues";

import { LabelQuery } from "../../queries/LabelQuery";
import { ChallengePullQuery } from "../../queries/ChallengePullQuery";
import { PullPayload } from "../payloads/PullPayload";

import {
  Config,
  DEFAULT_BRANCHES,
  DEFAULT_CONFIG_FILE_PATH,
} from "../../config/Config";
import { isValidBranch } from "../../services/utils/PullUtil";

const handlePullClosed = async (
  context: Context<EventPayloads.WebhookPayloadPullRequest>,
  challengePullService: ChallengePullService
) => {
  const pullKey = context.pullRequest();
  const { action, pull_request: pullRequest } = context.payload;
  const labels: LabelQuery[] = pullRequest.labels.map((label: LabelQuery) => {
    return {
      ...label,
    };
  });
  const { user } = pullRequest;

  const pullPayload: PullPayload = {
    action: action,
    owner: pullKey.owner,
    repo: pullKey.repo,
    number: pullKey.pull_number,
    pull: {
      ...pullRequest,
      user: {
        ...user,
      },
      labels: labels,
      createdAt: pullRequest.created_at,
      updatedAt: pullRequest.updated_at,
      closedAt: pullRequest.closed_at,
      mergedAt: pullRequest.merged_at,
      authorAssociation: pullRequest.author_association,
    },
  };

  const config = await context.config<Config>(DEFAULT_CONFIG_FILE_PATH, {
    branches: DEFAULT_BRANCHES,
  });
  if (!isValidBranch(config!.branches!, pullRequest.base.ref)) {
    return;
  }

  const reply = await challengePullService.countScoreWhenPullClosed(
    pullPayload
  );
  if (reply === undefined) {
    context.log.trace(`Do not need to count ${pullPayload}.`);
    return;
  }

  switch (reply.status) {
    case Status.Failed: {
      context.log.error(
        `Count ${pullPayload} failed because ${reply.message}.`
      );
      await context.octokit.issues.createComment(
        context.issue({ body: reply.message })
      );
      break;
    }
    case Status.Success: {
      context.log.info(`Count ${pullPayload} success.`);
      await context.octokit.issues.createComment(
        context.issue({ body: reply.message })
      );
      break;
    }
    case Status.Problematic: {
      context.log.warn(`Count ${pullPayload} has some problems.`);
      await context.octokit.issues.createComment(
        context.issue({ body: combineReplay(reply) })
      );
      break;
    }
  }
};

/**
 * Handle challenge pull request open.
 * @param context
 * @param challengePullService
 */
const handleChallengePullOpen = async (
  context: Context<EventPayloads.WebhookPayloadPullRequest>,
  challengePullService: ChallengePullService
) => {
  const issueKey = context.issue();
  const { pull_request: pullRequest } = context.payload;
  const labels: LabelQuery[] = pullRequest.labels.map((label: LabelQuery) => {
    return {
      ...label,
    };
  });
  const { payload } = context;
  const { user } = pullRequest;

  const pullPayload: ChallengePullQuery = {
    ...payload,
    ...issueKey,
    pull: {
      ...pullRequest,
      user: {
        ...user,
      },
      labels: labels,
      createdAt: pullRequest.created_at,
      updatedAt: pullRequest.updated_at,
      closedAt: pullRequest.closed_at,
      mergedAt: pullRequest.merged_at,
      authorAssociation: pullRequest.author_association,
    },
  };

  const config = await context.config<Config>(DEFAULT_CONFIG_FILE_PATH, {
    branches: DEFAULT_BRANCHES,
  });
  if (!isValidBranch(config!.branches!, pullRequest.base.ref)) {
    return;
  }

  const reply = await challengePullService.checkHasRewardToChallengePull(
    pullPayload
  );

  // It means not a challenge pull.
  if (reply === null) {
    return;
  }

  switch (reply.status) {
    case Status.Failed: {
      context.log.error(`${pullPayload} not reward ${reply.message}.`);
      await context.octokit.issues.createComment(
        context.issue({ body: reply.message })
      );
      break;
    }
    case Status.Success: {
      context.log.info(`${pullPayload} already rewarded.`);
      await context.octokit.issues.createComment(
        context.issue({ body: reply.message })
      );
      break;
    }
    case Status.Problematic: {
      await context.octokit.issues.createComment(
        context.issue({ body: combineReplay(reply) })
      );
      context.log.warn(`${pullPayload} check reward has some problems.`);
      break;
    }
  }
};

const handlePullEvents = async (
  context: Context<EventPayloads.WebhookPayloadPullRequest>,
  challengePullService: ChallengePullService
) => {
  if (context.payload.action === IssueOrPullActions.Closed) {
    await handlePullClosed(context, challengePullService);
  } else if (
    context.payload.action === IssueOrPullActions.Opened ||
    context.payload.action === IssueOrPullActions.Reopened
  ) {
    await handleChallengePullOpen(context, challengePullService);
  }
};

export { handlePullEvents };

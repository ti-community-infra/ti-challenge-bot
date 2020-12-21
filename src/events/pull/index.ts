import { Context } from "probot";

import { PullPayload } from "../payloads/PullPayload";

import { LabelQuery } from "../../queries/LabelQuery";

import { Status } from "../../services/reply";

import ChallengePullService from "../../services/challenge-pull";
import { combineReplay } from "../../services/utils/ReplyUtil";
import { IssueOrPullActions } from "../issues";

import { ChallengePullQuery } from "../../queries/ChallengePullQuery";
import {
  Config,
  DEFAULT_BRANCHES,
  DEFAULT_CONFIG_FILE_PATH,
} from "../../config/Config";
import {
  findLinkedIssueNumber,
  isValidBranch,
} from "../../services/utils/PullUtil";
import { ChallengePull } from "../../db/entities/ChallengePull";

const handlePullClosed = async (
  context: Context,
  challengePullService: ChallengePullService
) => {
  const { pull_request: pullRequest } = context.payload;
  const labels: LabelQuery[] = pullRequest.labels.map((label: LabelQuery) => {
    return {
      ...label,
    };
  });
  const { payload } = context;
  const { user } = pullRequest;

  const pullPayload: PullPayload = {
    ...payload,
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

  // Judge PR is associated with an Issue and uses close semantics
  const issueNumber = findLinkedIssueNumber(pullRequest.body);
  const closeIndex = pullRequest.body.toLowerCase().indexOf("close");
  if (issueNumber && closeIndex != -1) {
    const issueId = await challengePullService.getIssueIdByIssueNumber(
      issueNumber
    );
    const pullId = await challengePullService.getPullIdByPullNumber(
      pullPayload.number
    );
    if (issueId == undefined || pullId == undefined) {
      return;
    }
    // Query remaining score
    const currentLeftScore = await challengePullService.getCurrentIssueLeftScore(
      issueId,
      pullId
    );
    if (currentLeftScore == undefined) {
      return;
    }
    // Assign remaining scores to pr
    const newChallengeIssue = new ChallengePull();
    newChallengeIssue.pullId = pullId;
    newChallengeIssue.reward = currentLeftScore;
    newChallengeIssue.challengeIssueId = issueId;
    await challengePullService.rewardLeftSore(newChallengeIssue);
    await context.github.issues.createComment(
      context.issue({
        body:
          "Congratulations! You have successfully resolved this issue. Now, the remaining points for this issue is awarded to you. ",
      })
    );
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
      await context.github.issues.createComment(
        context.issue({ body: reply.message })
      );
      break;
    }
    case Status.Success: {
      context.log.info(`Count ${pullPayload} success.`);
      await context.github.issues.createComment(
        context.issue({ body: reply.message })
      );
      break;
    }
    case Status.Problematic: {
      context.log.warn(`Count ${pullPayload} has some problems.`);
      await context.github.issues.createComment(
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
  context: Context,
  challengePullService: ChallengePullService
) => {
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
    ...context.issue(),
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
      await context.github.issues.createComment(
        context.issue({ body: reply.message })
      );
      break;
    }
    case Status.Success: {
      context.log.info(`${pullPayload} already rewarded.`);
      await context.github.issues.createComment(
        context.issue({ body: reply.message })
      );
      break;
    }
    case Status.Problematic: {
      await context.github.issues.createComment(
        context.issue({ body: combineReplay(reply) })
      );
      context.log.warn(`${pullPayload} check reward has some problems.`);
      break;
    }
  }
};

const handlePullEvents = async (
  context: Context,
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

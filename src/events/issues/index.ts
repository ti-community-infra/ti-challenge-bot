import { Context } from "probot";
import { createOrUpdateNotification } from "../../commands/common/issue-update";
import IssueService from "../../services/issue";

import ChallengeIssueService from "../../services/challenge-issue";

import { LabelQuery } from "../../queries/LabelQuery";

import { IssuePayload } from "../payloads/IssuePayload";
import { isChallengeIssue } from "../../services/utils/IssueUtil";

import { Config, DEFAULT_CONFIG_FILE_PATH } from "../../config/Config";

import { ChallengeIssueQuery } from "../../queries/ChallengeIssueQuery";

import { Reply, Status } from "../../services/reply";
import { combineReplay } from "../../services/utils/ReplyUtil";

import { ChallengeIssue } from "../../db/entities/ChallengeIssue";
import { CHALLENGE_PROGRAM_LABEL } from "../../commands/labels";
import { UserQuery } from "../../queries/UserQuery";

export enum IssueOrPullActions {
  Opened = "opened",

  Edited = "edited",

  Labeled = "labeled",

  Unlabeled = "unlabeled",

  Closed = "closed",

  Reopened = "reopened",

  Assigned = "assigned",
}

/**
 * Construct issue payload and labels.
 * @param context
 */
const constructIssuePayloadAndLabels = (
  context: Context
): { payload: IssuePayload; labels: LabelQuery[] } => {
  const { issue: issuePayload } = context.payload;
  const labels: LabelQuery[] = issuePayload.labels.map((label: LabelQuery) => {
    return {
      ...label,
    };
  });

  const { user } = issuePayload;
  const assignees: UserQuery[] = issuePayload.assignees.map((a: UserQuery) => {
    return { ...a };
  });

  return {
    payload: {
      ...context.issue(),
      issue: {
        ...issuePayload,
        user: {
          ...user,
        },
        labels: labels,
        createdAt: issuePayload.created_at,
        updatedAt: issuePayload.updated_at,
        closedAt: issuePayload.closed_at,
        mergedAt: issuePayload.merged_at,
        authorAssociation: issuePayload.author_association,
        assignees,
      },
    },
    labels,
  };
};

/**
 * Handle the issue opened event.
 * @param context
 * @param issueService
 * @param challengeIssueService
 */
const handleIssuesOpened = async (
  context: Context,
  issueService: IssueService,
  challengeIssueService: ChallengeIssueService
) => {
  const { payload, labels } = constructIssuePayloadAndLabels(context);
  const issue = await issueService.add(payload);

  // Check if it is a challenge issue.
  if (isChallengeIssue(labels)) {
    // Get config form repo.
    const config = await context.config<Config>(DEFAULT_CONFIG_FILE_PATH);
    const challengeIssueQuery: ChallengeIssueQuery = {
      ...context.issue(),
      issue: payload.issue,
      defaultSigLabel: config?.defaultSigLabel,
    };

    const reply = await challengeIssueService.createWhenIssueOpened(
      issue.id,
      challengeIssueQuery
    );

    if (reply.status === Status.Failed) {
      context.log.error(
        `Create challenge issue failed ${challengeIssueQuery}.`
      );

      await createOrUpdateNotification(context, reply.message);
    }

    if (reply.status === Status.Problematic) {
      context.log.warn(
        `Create challenge issue have some problems ${challengeIssueQuery}.`
      );

      await createOrUpdateNotification(context, combineReplay(reply));
    }
  }
};

/**
 * Handle the issue edited event.
 * @param context
 * @param issueService
 * @param challengeIssueService
 */
const handleIssuesEdited = async (
  context: Context,
  issueService: IssueService,
  challengeIssueService: ChallengeIssueService
) => {
  const { payload, labels } = constructIssuePayloadAndLabels(context);

  // Notice: if the issue not exist we need to add it.
  const issue =
    (await issueService.update(payload)) || (await issueService.add(payload));

  if (isChallengeIssue(labels)) {
    const config = await context.config<Config>(DEFAULT_CONFIG_FILE_PATH);
    const challengeIssueQuery: ChallengeIssueQuery = {
      ...context.issue(),
      issue: payload.issue,
      defaultSigLabel: config?.defaultSigLabel,
    };

    // Notice: if the challenge issue not exist we need to add it.
    const reply =
      (await challengeIssueService.updateWhenIssueEdited(
        issue.id,
        challengeIssueQuery
      )) ||
      (await challengeIssueService.createWhenIssueOpened(
        issue.id,
        challengeIssueQuery
      ));
    if (reply.status === Status.Failed) {
      context.log.error(
        `Update challenge issue failed ${challengeIssueQuery}.`
      );

      await createOrUpdateNotification(context, reply.message);
    }

    if (reply.status === Status.Problematic) {
      context.log.warn(
        `Update challenge issue have some problems ${challengeIssueQuery}.`
      );

      await createOrUpdateNotification(context, combineReplay(reply));
    }
  }
};

/**
 * Handle issue labeled event.
 * @param context
 * @param issueService
 * @param challengeIssueService
 */
const handleIssuesLabeled = async (
  context: Context,
  issueService: IssueService,
  challengeIssueService: ChallengeIssueService
) => {
  const { payload, labels } = constructIssuePayloadAndLabels(context);

  // Try to find old issue.
  const oldIssue = await issueService.findOne({
    where: {
      issueNumber: payload.number,
    },
  });

  let reply: Reply<ChallengeIssue | undefined> | undefined;
  const config = await context.config<Config>(DEFAULT_CONFIG_FILE_PATH);
  const challengeIssueQuery: ChallengeIssueQuery = {
    ...context.issue(),
    issue: payload.issue,
    defaultSigLabel: config?.defaultSigLabel,
  };

  if (oldIssue === undefined) {
    // Notice: if the old issue not exist, we need to add it.
    const issue = await issueService.add(payload);

    if (isChallengeIssue(labels)) {
      reply = await challengeIssueService.createWhenIssueOpened(
        issue.id,
        challengeIssueQuery
      );
    }
  } else {
    // Notice: if the old issue exist, we need to update it.
    await issueService.update(payload);

    if (isChallengeIssue(labels)) {
      reply =
        (await challengeIssueService.updateWhenIssueEdited(
          oldIssue.id,
          challengeIssueQuery
        )) ||
        (await challengeIssueService.createWhenIssueOpened(
          oldIssue.id,
          challengeIssueQuery
        ));
    }
  }

  // If the reply is undefined, it means this issue not the challenge issue business.
  if (reply === undefined) {
    return;
  }

  if (reply.status === Status.Failed) {
    context.log.error(
      `Labeled challenge program and try to update or add challenge issue failed ${challengeIssueQuery}.`
    );

    await createOrUpdateNotification(context, reply.message);
  }

  if (reply.status === Status.Problematic) {
    context.log.warn(
      `Labeled challenge program and try to update or add challenge issue have some problems ${challengeIssueQuery}.`
    );

    await createOrUpdateNotification(context, combineReplay(reply));
  }
};

/**
 * Handl;e issue unlabeled event.
 * @param context
 * @param issueService
 * @param challengeIssueService
 */
const handleIssuesUnlabeled = async (
  context: Context,
  issueService: IssueService,
  challengeIssueService: ChallengeIssueService
) => {
  const { payload, labels } = constructIssuePayloadAndLabels(context);

  // Try to find old issue.
  const oldIssue = await issueService.findOne({
    where: {
      issueNumber: payload.number,
    },
  });

  // Notice: we need to update the issue's label.
  if (oldIssue === undefined) {
    await issueService.add(payload);
    return;
  } else {
    await issueService.update(payload);
  }

  // Current labels.
  const labelNames = labels.map((l) => {
    return l.name;
  });
  // Removed labels.
  const removedLabels = oldIssue.label.split(",").filter((l) => {
    return !labelNames.includes(l);
  });

  if (!removedLabels.includes(CHALLENGE_PROGRAM_LABEL)) {
    return;
  }

  const reply = await challengeIssueService.removeWhenIssueUnlabeled(
    oldIssue.id
  );

  // Notice: if the reply is undefined, it means we do not need remove it.
  if (reply === undefined) {
    return;
  }

  if (reply.status === Status.Failed) {
    context.log.error(
      `Unlabeled challenge program and try to remove challenge issue failed ${oldIssue}.`
    );

    await createOrUpdateNotification(context, reply.message);
    await context.github.issues.addLabels(
      context.issue({ labels: [CHALLENGE_PROGRAM_LABEL] })
    );
  }

  if (reply.status === Status.Success) {
    context.log.info(
      `Unlabeled challenge program and try to remove challenge issue have some problems ${oldIssue}.`
    );

    await createOrUpdateNotification(context, reply.message);
  }
};

/**
 * Handle issue closed and reopened events.
 * For these events we only need update the issue info.
 * @param context
 * @param issueService
 */
const handleIssuesClosedOrReopened = async (
  context: Context,
  issueService: IssueService
) => {
  const { payload } = constructIssuePayloadAndLabels(context);

  const issue = await issueService.update(payload);
  // Notice: if the issue not exist, we need to add it.
  if (issue === undefined) {
    await issueService.add(payload);
  }
};

const handleIssueEvents = async (
  context: Context,
  issueService: IssueService,
  challengeIssueService: ChallengeIssueService
) => {
  switch (context.payload.action) {
    case IssueOrPullActions.Opened: {
      await handleIssuesOpened(context, issueService, challengeIssueService);
      break;
    }
    case IssueOrPullActions.Edited: {
      await handleIssuesEdited(context, issueService, challengeIssueService);
      break;
    }
    case IssueOrPullActions.Labeled: {
      await handleIssuesLabeled(context, issueService, challengeIssueService);
      break;
    }
    case IssueOrPullActions.Unlabeled: {
      await handleIssuesUnlabeled(context, issueService, challengeIssueService);
      break;
    }

    case IssueOrPullActions.Closed: {
      await handleIssuesClosedOrReopened(context, issueService);
      break;
    }

    case IssueOrPullActions.Reopened: {
      await handleIssuesClosedOrReopened(context, issueService);
      break;
    }
  }
};

export default handleIssueEvents;

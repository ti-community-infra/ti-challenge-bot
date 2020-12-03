import { Context } from "probot";

import { PickUpQuery } from "../../queries/PickUpQuery";
import {
  createOrUpdateNotification,
  createOrUpdateStatus,
} from "../common/issue-update";
import { LabelQuery } from "../../queries/LabelQuery";
import { Status } from "../../services/reply";

import { Config, DEFAULT_CONFIG_FILE_PATH } from "../../config/Config";
import { PICKED_LABEL } from "../labels";

import ChallengeIssueService from "../../services/challenge-issue";
import { combineReplay } from "../../services/utils/ReplyUtil";

/**
 * Pick up the issue.
 * @param context
 * @param challengeIssueService
 */
const pickUp = async (
  context: Context,
  challengeIssueService: ChallengeIssueService
) => {
  // Notice: because the context come form issue_comment.created event,
  // so we need to get this issue.
  const issueResponse = await context.github.issues.get(context.issue());
  const issue = context.issue();
  const { data } = issueResponse;
  const { sender } = context.payload;
  const labels: LabelQuery[] = data.labels.map((label) => {
    return {
      ...label,
    };
  });
  const { user } = data;
  const config = await context.config<Config>(DEFAULT_CONFIG_FILE_PATH);

  const pickUpQuery: PickUpQuery = {
    challenger: sender.login,
    ...issue,
    issue: {
      ...data,
      user: {
        ...user,
      },
      labels: labels,
      // @ts-ignore
      closedAt: data.closed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
    defaultSigLabel: config?.defaultSigLabel,
  };

  const reply = await challengeIssueService.pickUp(pickUpQuery);

  switch (reply.status) {
    case Status.Failed: {
      context.log.error(
        `Pick up ${pickUpQuery} failed because ${reply.message}.`
      );

      await createOrUpdateNotification(context, reply.message, sender.login);
      break;
    }
    case Status.Success: {
      // Add picked label.
      context.log.info(`Pick up ${pickUpQuery} success.`);
      await context.github.issues.addLabels(
        context.issue({ labels: [PICKED_LABEL] })
      );
      if (reply.warning !== undefined || reply.tip !== undefined) {
        await createOrUpdateNotification(
          context,
          combineReplay(reply),
          sender.login
        );
        // FIXME: maybe we should pass a program instead of the title.

        await createOrUpdateStatus(
          context,
          sender.login,
          issueResponse.data.title
        );
      } else {
        await createOrUpdateNotification(context, reply.message, sender.login);
        await createOrUpdateStatus(
          context,
          sender.login,
          issueResponse.data.title
        );
      }
      break;
    }
    case Status.Problematic: {
      context.log.warn(`Pick up ${pickUpQuery} has some problems.`);

      await createOrUpdateNotification(
        context,
        combineReplay(reply),
        sender.login
      );
      await createOrUpdateStatus(
        context,
        sender.login,
        issueResponse.data.title
      );
      break;
    }
  }
};

export default pickUp;

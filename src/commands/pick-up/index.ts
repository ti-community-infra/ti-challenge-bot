import { Context } from "probot";

import { PickUpQuery } from "../../queries/PickUpQuery";

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
  const issue = context.issue();
  const issueResponse = await context.github.issues.get({
    owner: issue.owner,
    repo: issue.repo,
    issue_number: issue.number,
  });
  const { data } = issueResponse;
  const { sender } = context.payload;
  const labels: LabelQuery[] = data.labels.map((label) => {
    return {
      ...label,
    };
  });
  const { user } = data;
  const config = await context.config<Config>(DEFAULT_CONFIG_FILE_PATH);

  // Check it is not a pull request.
  if (data.pull_request != null) {
    context.log.warn("Picking up a pull request is not allowed.");
    return;
  }

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
      await context.github.issues.createComment(
        context.issue({ body: reply.message })
      );
      break;
    }
    case Status.Success: {
      // Add picked label.
      context.log.info(`Pick up ${pickUpQuery} success.`);
      await context.github.issues.addLabels(
        context.issue({ labels: [PICKED_LABEL] })
      );
      if (reply.warning !== undefined || reply.tip !== undefined) {
        await context.github.issues.createComment(
          context.issue({ body: combineReplay(reply) })
        );
      } else {
        await context.github.issues.createComment(
          context.issue({ body: reply.message })
        );
      }
      break;
    }
    case Status.Problematic: {
      context.log.warn(`Pick up ${pickUpQuery} has some problems.`);
      await context.github.issues.createComment(
        context.issue({ body: combineReplay(reply) })
      );
      break;
    }
  }
};

export default pickUp;

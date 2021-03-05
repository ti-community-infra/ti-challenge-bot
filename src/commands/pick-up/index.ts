import { Context } from "probot";
import { components } from "@octokit/openapi-types";
import { EventPayloads } from "@octokit/webhooks";

import { PickUpQuery } from "../../queries/PickUpQuery";
import { LabelQuery } from "../../queries/LabelQuery";

import { Config, DEFAULT_CONFIG_FILE_PATH } from "../../config/Config";
import { PICKED_LABEL } from "../labels";

import { IChallengeIssueService } from "../../services/challenge-issue";
import { Status } from "../../services/reply";
import { combineReplay } from "../../services/utils/ReplyUtil";
import { ChallengeIssueWarning } from "../../services/messages/ChallengeIssueMessage";

/**
 * Pick up the issue.
 * @param context
 * @param challengeIssueService
 */
const pickUp = async (
  context: Context<EventPayloads.WebhookPayloadIssueComment>,
  challengeIssueService: IChallengeIssueService
) => {
  // Notice: because the context come form issue_comment.created event,
  // so we need to get this issue.
  const issueKey = context.issue();
  const issueResponse = await context.octokit.issues.get(issueKey);
  const { data: issue } = issueResponse;
  const { sender } = context.payload;

  // Check if an issue, if it is a pull request, no response.
  if (issue.pull_request != null) {
    context.log.warn(ChallengeIssueWarning.NotAllowedToPickUpAPullRequest);
    return;
  }

  const labels: LabelQuery[] = issue.labels.map((label) => {
    return {
      ...(label as components["schemas"]["label"]),
    };
  });
  const { user } = issue;
  const config = await context.config<Config>(DEFAULT_CONFIG_FILE_PATH);

  const pickUpQuery: PickUpQuery = {
    challenger: sender.login,
    ...issueKey,
    issue: {
      ...issue,
      user: user,
      labels: labels,
      authorAssociation: issue.author_association,
      assignees: issue.assignees,
      closedAt: issue.closed_at,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
    },
    defaultSigLabel: config?.defaultSigLabel,
  };

  const reply = await challengeIssueService.pickUp(pickUpQuery);

  switch (reply.status) {
    case Status.Failed: {
      context.log.error(
        `Pick up ${pickUpQuery} failed because ${reply.message}.`
      );
      await context.octokit.issues.createComment(
        context.issue({ body: reply.message })
      );
      break;
    }
    case Status.Success: {
      // Add picked label.
      context.log.info(`Pick up ${pickUpQuery} success.`);
      await context.octokit.issues.addLabels(
        context.issue({ labels: [PICKED_LABEL] })
      );
      if (reply.warning !== undefined || reply.tip !== undefined) {
        await context.octokit.issues.createComment(
          context.issue({ body: combineReplay(reply) })
        );
      } else {
        await context.octokit.issues.createComment(
          context.issue({ body: reply.message })
        );
      }
      break;
    }
    case Status.Problematic: {
      context.log.warn(`Pick up ${pickUpQuery} has some problems.`);
      await context.octokit.issues.createComment(
        context.issue({ body: combineReplay(reply) })
      );
      break;
    }
  }
};

export default pickUp;

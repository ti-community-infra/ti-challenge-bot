import { Context } from "probot";
import { components } from "@octokit/openapi-types";
import { EventPayloads } from "@octokit/webhooks";

import { GiveUpQuery } from "../../queries/GiveUpQuery";
import { LabelQuery } from "../../queries/LabelQuery";

import { IChallengeIssueService } from "../../services/challenge-issue";
import { Status } from "../../services/reply";
import { ChallengeIssueWarning } from "../../services/messages/ChallengeIssueMessage";

import { PICKED_LABEL } from "../labels";

/**
 * Give up challenge issue.
 * @param context
 * @param challengeIssueService
 */
const giveUp = async (
  context: Context<EventPayloads.WebhookPayloadIssueComment>,
  challengeIssueService: IChallengeIssueService
) => {
  const issueKey = context.issue();
  const { data: issue } = await context.octokit.issues.get(issueKey);

  // Check if an issue, if it is a pull request, no response.
  if (issue.pull_request != null) {
    context.log.warn(ChallengeIssueWarning.NotAllowedToGiveUpAPullRequest);
    return;
  }

  const { sender } = context.payload;
  const labels: LabelQuery[] = issue.labels.map((label) => {
    return {
      ...(label as components["schemas"]["label"]),
    };
  });
  const giveUpQuery: GiveUpQuery = {
    challenger: sender.login,
    issueId: issue.number,
    labels,
  };

  const reply = await challengeIssueService.giveUp(giveUpQuery);

  if (reply === undefined) {
    return;
  }

  switch (reply.status) {
    case Status.Failed: {
      context.log.error(
        `Give up ${giveUpQuery} failed because ${reply.message}.`
      );
      break;
    }
    case Status.Success: {
      await context.octokit.issues.removeLabel(
        context.issue({
          name: PICKED_LABEL,
        })
      );
      context.log.info(`Give up ${giveUpQuery} success.`);
      break;
    }
  }

  await context.octokit.issues.createComment(
    context.issue({ body: reply.message })
  );
};

export default giveUp;

import { Context } from "probot";

import { GiveUpQuery } from "../../queries/GiveUpQuery";

import { IChallengeIssueService } from "../../services/challenge-issue";

import { LabelQuery } from "../../queries/LabelQuery";
import { Status } from "../../services/reply";
import { PICKED_LABEL } from "../labels";
import { ChallengeIssueWarning } from "../../services/messages/ChallengeIssueMessage";

/**
 * Give up challenge issue.
 * @param context
 * @param challengeIssueService
 */
const giveUp = async (
  context: Context,
  challengeIssueService: IChallengeIssueService
) => {
  const issue = context.issue();
  const issueResponse = await context.github.issues.get({
    owner: issue.owner,
    repo: issue.repo,
    issue_number: issue.number,
  });
  const { data } = issueResponse;

  // Check if an issue, if it is a pull request, no response.
  if (data.pull_request != null) {
    context.log.warn(ChallengeIssueWarning.NotAllowedToGiveUpAPullRequest);
    return;
  }

  const { sender } = context.payload;
  const labels: LabelQuery[] = data.labels.map((label) => {
    return {
      ...label,
    };
  });
  const giveUpQuery: GiveUpQuery = {
    challenger: sender.login,
    issueId: data.number,
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
      await context.github.issues.removeLabel(
        context.issue({
          name: PICKED_LABEL,
        })
      );
      context.log.info(`Give up ${giveUpQuery} success.`);
      break;
    }
  }

  await context.github.issues.createComment(
    context.issue({ body: reply.message })
  );
};

export default giveUp;

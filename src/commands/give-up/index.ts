import { Context } from "probot";
import {
  createOrUpdateStatus,
  createOrUpdateNotification,
} from "../../services/utils/IssueUtil";
import { GiveUpQuery } from "../../queries/GiveUpQuery";

import ChallengeIssueService from "../../services/challenge-issue";

import { LabelQuery } from "../../queries/LabelQuery";
import { Status } from "../../services/reply";
import { PICKED_LABEL } from "../labels";

/**
 * Give up challenge issue.
 * @param context
 * @param challengeIssueService
 */
const giveUp = async (
  context: Context,
  challengeIssueService: ChallengeIssueService
) => {
  const issueResponse = await context.github.issues.get(context.issue());
  const { data } = issueResponse;
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
  
  await createOrUpdateNotification(context, reply.message, data.user.login);
  await createOrUpdateStatus(context);
};

export default giveUp;

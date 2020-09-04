// eslint-disable-next-line no-unused-vars
import { Context } from 'probot'

// eslint-disable-next-line no-unused-vars
import { LabelQuery } from '../../commands/queries/LabelQuery'
// eslint-disable-next-line no-unused-vars
import { Status } from '../../services/reply'
// eslint-disable-next-line no-unused-vars
import ChallengePullService from '../../services/challenge-pull'
import { combineReplay } from '../../services/utils/ReplyUtil'
// eslint-disable-next-line no-unused-vars
import { ChallengePullQuery } from '../../commands/queries/ChallengePullQuery'

/**
 * Handle LGTM custom event.
 * When we got a lgtm, we need check if challenge pull rewarded.
 * @param context
 * @param challengePullService
 */
const handleLgtm = async (context: Context, challengePullService: ChallengePullService) => {
  const pullResponse = await context.github.pulls.get(context.issue())
  const { data } = pullResponse
  const labels: LabelQuery[] = data.labels.map(label => {
    return {
      ...label
    }
  })
  const issue = context.issue()
  const { user } = data

  const challengePullQuery: ChallengePullQuery = {
    ...issue,
    pull: {
      ...data,
      user: {
        ...user
      },
      labels: labels,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      closedAt: data.closed_at,
      mergedAt: data.merged_at,
      authorAssociation: data.author_association
    }
  }

  const reply = await challengePullService.checkHasRewardToChallengePull(challengePullQuery)

  // It means not a challenge pull.
  if (reply === undefined) {
    return
  }

  switch (reply.status) {
    case Status.Success: {
      // Do nothing, if already rewarded.
      return
    }
    case Status.Problematic: {
      await context.github.issues.createComment(context.issue({ body: combineReplay(reply) }))
      break
    }
  }
}
export { handleLgtm }

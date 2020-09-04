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
  const reply = await challengePullService.checkReward(challengePullQuery)

  if (reply === undefined) {
    return
  }

  switch (reply.status) {
    case Status.Success: {
      return
    }
    case Status.Failed: {
      await context.github.issues.createComment(context.issue({ body: reply.message }))
      break
    }
    case Status.Problematic: {
      await context.github.issues.createComment(context.issue({ body: combineReplay(reply) }))
      break
    }
  }
}
export { handleLgtm }

// eslint-disable-next-line no-unused-vars
import { Context } from 'probot'

// eslint-disable-next-line no-unused-vars
import { PullPayload } from '../payloads/PullPayload'
// eslint-disable-next-line no-unused-vars
import { LabelQuery } from '../../commands/queries/LabelQuery'
// eslint-disable-next-line no-unused-vars
import { Status } from '../../services/reply'
// eslint-disable-next-line no-unused-vars
import ChallengePullService from '../../services/challenge-pull'

const handlePullClosed = async (context: Context, challengePullService: ChallengePullService) => {
  const { pull_request: pullRequest } = context.payload
  const labels: LabelQuery[] = pullRequest.labels.map((label: LabelQuery) => {
    return {
      ...label
    }
  })
  const { payload } = context
  const { user } = pullRequest

  const pullPayload: PullPayload = {
    ...payload,
    pull: {
      ...pullRequest,
      user: {
        ...user
      },
      labels: labels,
      createdAt: pullRequest.created_at,
      updatedAt: pullRequest.updated_at,
      closedAt: pullRequest.closed_at,
      mergedAt: pullRequest.merged_at,
      authorAssociation: pullRequest.author_association
    }
  }

  const result = await challengePullService.count(pullPayload)
  if (result === undefined) {
    context.log.trace(`Do not need to count ${pullPayload}.`)
    return
  }

  switch (result.status) {
    case Status.Failed: {
      context.log.error(`Count ${pullPayload} failed because ${result.message}.`)
      break
    }
    case Status.Success: {
      context.log.info(`Count ${pullPayload} success.`)
      break
    }
  }

  await context.github.issues.createComment(context.issue({ body: result.message }))
}

export { handlePullClosed }

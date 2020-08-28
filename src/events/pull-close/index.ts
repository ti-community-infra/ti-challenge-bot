// eslint-disable-next-line no-unused-vars
import { Context } from 'probot'
// eslint-disable-next-line no-unused-vars
import { PullPayload } from '../payloads/PullPayload'
// eslint-disable-next-line no-unused-vars
import { LabelQuery } from '../../commands/queries/LabelQuery'
// eslint-disable-next-line no-unused-vars
import CountService from '../../services/count'

const handlePullClose = async (context: Context, countService: CountService) => {
  const { pull_request: pullRequest } = context.payload

  const labels: LabelQuery[] = pullRequest.labels.map((label: LabelQuery) => {
    return {
      id: label.id,
      name: label.name,
      description: label.description,
      default: label.default
    }
  })

  const pullPayload: PullPayload = {
    action: context.payload.action,
    number: context.payload.number,
    pull: {
      id: pullRequest.id,
      number: pullRequest.number,
      state: pullRequest.state,
      title: pullRequest.title,
      user: {
        login: pullRequest.user.login,
        id: pullRequest.user.id,
        type: pullRequest.user.type
      },
      body: pullRequest.body,
      labels: labels,
      createdAt: pullRequest.created_at,
      updatedAt: pullRequest.updated_at,
      closedAt: pullRequest.closed_at,
      mergedAt: pullRequest.merged_at,
      authorAssociation: pullRequest.author_association
    }
  }

  const result = await countService.count(pullPayload)
  if (result === undefined) {
    return
  }

  await context.github.issues.createComment(context.issue({ body: result.message }))
}

export { handlePullClose }

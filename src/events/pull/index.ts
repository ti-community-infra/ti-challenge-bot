// eslint-disable-next-line no-unused-vars
import { Context } from 'probot'

// eslint-disable-next-line no-unused-vars
import { PullPayload } from '../payloads/PullPayload'
// eslint-disable-next-line no-unused-vars
import { LabelQuery } from '../../queries/LabelQuery'
// eslint-disable-next-line no-unused-vars
import { Status } from '../../services/reply'
// eslint-disable-next-line no-unused-vars
import ChallengePullService from '../../services/challenge-pull'
import { combineReplay } from '../../services/utils/ReplyUtil'
import { IssueOrPullActions } from '../issues'
// eslint-disable-next-line no-unused-vars
import { ChallengePullQuery } from '../../queries/ChallengePullQuery'

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

  const reply = await challengePullService.countScoreWhenPullClosed(pullPayload)
  if (reply === undefined) {
    context.log.trace(`Do not need to count ${pullPayload}.`)
    return
  }

  switch (reply.status) {
    case Status.Failed: {
      context.log.error(`Count ${pullPayload} failed because ${reply.message}.`)
      await context.github.issues.createComment(context.issue({ body: reply.message }))
      break
    }
    case Status.Success: {
      context.log.info(`Count ${pullPayload} success.`)
      await context.github.issues.createComment(context.issue({ body: reply.message }))
      break
    }
    case Status.Problematic: {
      context.log.warn(`Count ${pullPayload} has some problems.`)
      await context.github.issues.createComment(context.issue({ body: combineReplay(reply) }))
      break
    }
  }
}

const handleChallengePull = async (context: Context, challengePullService: ChallengePullService) => {
  const { pull_request: pullRequest } = context.payload
  const labels: LabelQuery[] = pullRequest.labels.map((label: LabelQuery) => {
    return {
      ...label
    }
  })
  const { payload } = context
  const { user } = pullRequest

  const pullPayload: ChallengePullQuery = {
    ...payload,
    ...context.issue(),
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

  const reply = await challengePullService.checkHasRewardToChallengePull(pullPayload)

  // It means not a challenge pull.
  if (reply === undefined) {
    return
  }

  const status = {
    sha: pullRequest.head.sha,
    state: reply.status === Status.Success ? 'success' : 'failure',
    target_url: 'https://github.com/tidb-community-bots/ti-community-bot',
    description: reply.message,
    context: 'Challenge Pull Request Reward'
  }

  switch (reply.status) {
    case Status.Failed: {
      context.log.error(`${pullPayload} not reward ${reply.message}.`)
      await context.github.issues.createComment(
        context.issue({ body: reply.message })
      )
      // @ts-ignore
      await context.github.repos.createStatus({
        ...context.repo(),
        ...status
      })
      break
    }
    case Status.Success: {
      context.log.info(`${pullPayload} already rewarded.`)
      // @ts-ignore
      await context.github.repos.createStatus({
        ...context.repo(),
        ...status
      })
      break
    }
    case Status.Problematic: {
      context.log.warn(`${pullPayload} check reward has some problems.`)
      await context.github.issues.createComment(
        context.issue({ body: combineReplay(reply) })
      )
      // @ts-ignore
      await context.github.repos.createStatus({
        ...context.repo(),
        ...status
      })
      break
    }
  }
}

const handlePullEvents = async (context:Context, challengePullService: ChallengePullService) => {
  if (context.payload.action === IssueOrPullActions.Closed) {
    await handlePullClosed(context, challengePullService)
  } else {
    await handleChallengePull(context, challengePullService)
  }
}

export { handlePullEvents }

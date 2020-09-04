// eslint-disable-next-line no-unused-vars
import { Context } from 'probot'
// eslint-disable-next-line no-unused-vars
import IssueService from '../../services/issue'
// eslint-disable-next-line no-unused-vars
import ChallengeIssueService from '../../services/challenge-issue'
// eslint-disable-next-line no-unused-vars
import { LabelQuery } from '../../commands/queries/LabelQuery'
// eslint-disable-next-line no-unused-vars
import { IssuePayload } from '../payloads/IssuePayload'
import { isChallengeIssue } from '../../services/utils/IssueUtil'
// eslint-disable-next-line no-unused-vars
import { Config, DEFAULT_CONFIG_FILE_PATH } from '../../config/Config'
// eslint-disable-next-line no-unused-vars
import { ChallengeIssueQuery } from '../../commands/queries/ChallengeIssueQuery'
// eslint-disable-next-line no-unused-vars
import { Reply, Status } from '../../services/reply'
import { combineReplay } from '../../services/utils/ReplyUtil'
// eslint-disable-next-line no-unused-vars
import { ChallengeIssue } from '../../db/entities/ChallengeIssue'
import { CHALLENGE_PROGRAM_LABEL } from '../../commands/labels'

enum IssueActions{
    // eslint-disable-next-line no-unused-vars
    Opened = 'opened',
    // eslint-disable-next-line no-unused-vars
    Edited = 'edited',
    // eslint-disable-next-line no-unused-vars
    Labeled = 'labeled',
    // eslint-disable-next-line no-unused-vars
    Unlabeled = 'unlabeled',
    // eslint-disable-next-line no-unused-vars
    Closed = 'closed',
    // eslint-disable-next-line no-unused-vars
    Reopened = 'reopened'
}

const constructIssuePayload = (context: Context): {payload:IssuePayload, labels: LabelQuery[]} => {
  const { issue: issuePayload } = context.payload
  const labels: LabelQuery[] = issuePayload.labels.map((label: LabelQuery) => {
    return {
      ...label
    }
  })

  const { user } = issuePayload

  return {
    payload: {
      ...context.issue(),
      issue: {
        ...issuePayload,
        user: {
          ...user
        },
        labels: labels,
        createdAt: issuePayload.created_at,
        updatedAt: issuePayload.updated_at,
        closedAt: issuePayload.closed_at,
        mergedAt: issuePayload.merged_at,
        authorAssociation: issuePayload.author_association
      }
    },
    labels
  }
}

const handleIssuesOpened = async (context: Context, issueService: IssueService, challengeIssueService: ChallengeIssueService) => {
  const { payload, labels } = constructIssuePayload(context)

  const issue = await issueService.add(payload)

  if (isChallengeIssue(labels)) {
    const config = await context.config<Config>(DEFAULT_CONFIG_FILE_PATH)

    const challengeIssueQuery: ChallengeIssueQuery = {
      ...context.issue(),
      issue: payload.issue,
      defaultSigLabel: config?.defaultSigLabel
    }

    const reply = await challengeIssueService.createWhenIssueOpened(issue.id, challengeIssueQuery)

    if (reply.status === Status.Failed) {
      await context.github.issues.createComment(context.issue({ body: reply.message }))
    }

    if (reply.status === Status.Problematic) {
      await context.github.issues.createComment(context.issue({ body: combineReplay(reply) }))
    }
  }
}

const handleIssuesEdited = async (context: Context, issueService: IssueService, challengeIssueService: ChallengeIssueService) => {
  const { payload, labels } = constructIssuePayload(context)

  const issue = await issueService.update(payload) ||
        await issueService.add(payload)

  if (isChallengeIssue(labels)) {
    const config = await context.config<Config>(DEFAULT_CONFIG_FILE_PATH)

    const challengeIssueQuery: ChallengeIssueQuery = {
      ...context.issue(),
      issue: payload.issue,
      defaultSigLabel: config?.defaultSigLabel
    }

    const reply = await challengeIssueService.updateWhenIssueEdited(issue.id, challengeIssueQuery) ||
            await challengeIssueService.createWhenIssueOpened(issue.id, challengeIssueQuery)

    if (reply.status === Status.Failed) {
      await context.github.issues.createComment(context.issue({ body: reply.message }))
    }

    if (reply.status === Status.Problematic) {
      await context.github.issues.createComment(context.issue({ body: combineReplay(reply) }))
    }
  }
}

const handleIssuesLabeled = async (context: Context, issueService: IssueService, challengeIssueService: ChallengeIssueService) => {
  const { payload, labels } = constructIssuePayload(context)

  const oldIssue = await issueService.findOne({
    where: {
      issueNumber: payload.number
    }
  })

  let reply: Reply<ChallengeIssue|undefined> | undefined
  const config = await context.config<Config>(DEFAULT_CONFIG_FILE_PATH)

  const challengeIssueQuery: ChallengeIssueQuery = {
    ...context.issue(),
    issue: payload.issue,
    defaultSigLabel: config?.defaultSigLabel
  }

  if (oldIssue === undefined) {
    const issue = await issueService.add(payload)

    if (isChallengeIssue(labels)) {
      reply = await challengeIssueService.createWhenIssueOpened(issue.id, challengeIssueQuery)
    }
  } else {
    await issueService.update(payload)

    const oldLabels = oldIssue.label.split(',')
    const addedLabels = labels.filter(l => {
      return !oldLabels.includes(l.name)
    })

    if (isChallengeIssue(addedLabels)) {
      reply = await challengeIssueService.updateWhenIssueEdited(oldIssue.id, challengeIssueQuery) ||
                await challengeIssueService.createWhenIssueOpened(oldIssue.id, challengeIssueQuery)
    }
  }

  if (reply === undefined) {
    return
  }

  if (reply.status === Status.Failed) {
    await context.github.issues.createComment(context.issue({ body: reply.message }))
  }

  if (reply.status === Status.Problematic) {
    await context.github.issues.createComment(context.issue({ body: combineReplay(reply) }))
  }
}

const handleIssuesUnlabeled = async (context: Context, issueService: IssueService, challengeIssueService: ChallengeIssueService) => {
  const { payload, labels } = constructIssuePayload(context)

  const oldIssue = await issueService.findOne({
    where: {
      issueNumber: payload.number
    }
  })

  if (oldIssue === undefined) {
    await issueService.add(payload)
    return
  } else {
    await issueService.update(payload)
  }

  const labelNames = labels.map(l => {
    return l.name
  })
  const removedLabels = oldIssue.label.split(',').filter(l => {
    return !labelNames.includes(l)
  })

  if (!removedLabels.includes(CHALLENGE_PROGRAM_LABEL)) {
    return
  }

  const reply = await challengeIssueService.removeWhenIssueUnlabeled(oldIssue.id)

  if (reply === undefined) {
    return
  }

  if (reply.status === Status.Failed) {
    await context.github.issues.createComment(context.issue({ body: reply.message }))
    await context.github.issues.addLabels(context.issue({ labels: [CHALLENGE_PROGRAM_LABEL] }))
  }

  if (reply.status === Status.Success) {
    await context.github.issues.createComment(context.issue({ body: reply.message }))
  }
}

const handleIssuesClosedOrReopened = async (context: Context, issueService: IssueService) => {
  const { payload } = constructIssuePayload(context)

  const issue = await issueService.update(payload)
  if (issue === undefined) {
    await issueService.add(payload)
  }
}

const handleIssueEvents = async (context: Context, issueService: IssueService, challengeIssueService: ChallengeIssueService) => {
  switch (context.payload.action) {
    case IssueActions.Opened: {
      await handleIssuesOpened(context, issueService, challengeIssueService)
      break
    }
    case IssueActions.Edited: {
      await handleIssuesEdited(context, issueService, challengeIssueService)
      break
    }
    case IssueActions.Labeled: {
      await handleIssuesLabeled(context, issueService, challengeIssueService)
      break
    }
    case IssueActions.Unlabeled: {
      await handleIssuesUnlabeled(context, issueService, challengeIssueService)
      break
    }

    case IssueActions.Closed: {
      await handleIssuesClosedOrReopened(context, issueService)
      break
    }

    case IssueActions.Reopened: {
      await handleIssuesClosedOrReopened(context, issueService)
      break
    }
  }
}

export default handleIssueEvents

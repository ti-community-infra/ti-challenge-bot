// eslint-disable-next-line no-unused-vars
import { Context } from 'probot'
// eslint-disable-next-line no-unused-vars
import IssueService from '../../services/issue'
// eslint-disable-next-line no-unused-vars
import { LabelQuery } from '../../commands/queries/LabelQuery'
// eslint-disable-next-line no-unused-vars
import { IssuePayload } from '../payloads/IssuePayload'
// eslint-disable-next-line no-unused-vars
import ChallengeIssueService from '../../services/challenge-issue'
import { isChallengeIssue } from '../../services/utils/IssueUtil'
// eslint-disable-next-line no-unused-vars
import { ChallengeIssueQuery } from '../../commands/queries/ChallengeIssueQuery'
// eslint-disable-next-line no-unused-vars
import { Config, DEFAULT_CONFIG_FILE_PATH } from '../../config/Config'
// eslint-disable-next-line no-unused-vars
import { Reply, Status } from '../../services/reply'
import { combineReplay } from '../../services/utils/ReplyUtil'
// eslint-disable-next-line no-unused-vars
import { ChallengeIssue } from '../../db/entities/ChallengeIssue'

const handleIssuesLabeled = async (context: Context, issueService: IssueService, challengeIssueService: ChallengeIssueService) => {
  const { issue: issuePayload } = context.payload
  const labels: LabelQuery[] = issuePayload.labels.map((label: LabelQuery) => {
    return {
      ...label
    }
  })

  const { user } = issuePayload

  const payload : IssuePayload = {
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
  }

  let issue = await issueService.findOne({
    where: {
      issueNumber: issuePayload.number
    }
  })

  let reply: Reply<ChallengeIssue|undefined> | undefined
  const config = await context.config<Config>(DEFAULT_CONFIG_FILE_PATH)

  const challengeIssueQuery: ChallengeIssueQuery = {
    ...context.issue(),
    issue: payload.issue,
    defaultSigLabel: config?.defaultSigLabel
  }

  if (issue === undefined) {
    issue = await issueService.add(payload)

    if (isChallengeIssue(labels)) {
      reply = await challengeIssueService.createWhenIssueOpened(issue.id, challengeIssueQuery)
    }
  } else {
    const oldLabels = issue.label.split(',')
    const addedLabels = labels.filter(l => {
      return !oldLabels.includes(l.name)
    })

    if (isChallengeIssue(addedLabels)) {
      reply = await challengeIssueService.updateWhenIssueEdited(issue.id, challengeIssueQuery) ||
          await challengeIssueService.createWhenIssueOpened(issue.id, challengeIssueQuery)
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

export default handleIssuesLabeled

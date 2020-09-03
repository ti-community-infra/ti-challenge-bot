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
import { Status } from '../../services/reply'
import { combineReplay } from '../../services/utils/ReplyUtil'

const handleIssuesEdited = async (context: Context, issueService: IssueService, challengeIssueService: ChallengeIssueService) => {
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

  const issue = await issueService.update(payload)
  if (issue === undefined) {
    return
  }

  if (isChallengeIssue(labels)) {
    const config = await context.config<Config>(DEFAULT_CONFIG_FILE_PATH)

    const challengeIssueQuery: ChallengeIssueQuery = {
      ...context.issue(),
      issue: payload.issue,
      defaultSigLabel: config?.defaultSigLabel
    }

    const reply = await challengeIssueService.updateWhenIssueEdited(issue.id, challengeIssueQuery)
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
}

export default handleIssuesEdited

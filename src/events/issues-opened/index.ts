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

const handleIssuesOpened = async (context: Context, issueService: IssueService, challengeIssueService: ChallengeIssueService) => {
  const { issue } = context.payload
  const labels: LabelQuery[] = issue.labels.map((label: LabelQuery) => {
    return {
      ...label
    }
  })

  const { user } = issue

  const issuePayload : IssuePayload = {
    ...context.issue(),
    issue: {
      ...issue,
      user: {
        ...user
      },
      labels: labels,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      closedAt: issue.closed_at,
      mergedAt: issue.merged_at,
      authorAssociation: issue.author_association
    }
  }

  await issueService.add(issuePayload)

  if (isChallengeIssue(labels)) {
    const config = await context.config<Config>(DEFAULT_CONFIG_FILE_PATH)

    const challengeIssueQuery: ChallengeIssueQuery = {
      ...context.issue(),
      issue: issuePayload.issue,
      defaultSigLabel: config?.defaultSigLabel
    }

    const reply = await challengeIssueService.add(challengeIssueQuery)

    if (reply.status === Status.Failed) {
      await context.github.issues.createComment(context.issue({ body: reply.message }))
    }

    if (reply.status === Status.Success && reply.warning !== undefined) {
      await context.github.issues.createComment(context.issue({ body: combineReplay(reply) }))
    }
  }
}

export default handleIssuesOpened

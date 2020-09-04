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
// eslint-disable-next-line no-unused-vars
import { Status } from '../../services/reply'
import { CHALLENGE_PROGRAM_LABEL } from '../../commands/labels'

const handleIssuesUnlabeled = async (context: Context, issueService: IssueService, challengeIssueService: ChallengeIssueService) => {
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

  const oldIssue = await issueService.findOne({
    where: {
      issueNumber: issuePayload.number
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

export default handleIssuesUnlabeled

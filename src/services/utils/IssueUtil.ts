// eslint-disable-next-line no-unused-vars
import { LabelQuery } from '../../commands/queries/LabelQuery'
// eslint-disable-next-line no-unused-vars
import { IssueQuery } from '../../commands/queries/IssueQuery'
import { IssueOrPullStatus } from '../../repositoies/score'
import { CHALLENGE_PROGRAM_LABEL } from '../../commands/labels'

const MENTOR_REGEX = /(Mentor).*[\r\n]*[-|* ]*[@]*([a-z0-9](?:-?[a-z0-9]){0,38})/i
const SCORE_REGEX = /(Score).*[\r\n]+[-|* ]*([0-9]*)/

export interface MentorAndScore{
    mentor: string,
    score: number,
}

export function findMentorAndScore (issueBody: string):MentorAndScore | undefined {
  const mentorData = issueBody.match(MENTOR_REGEX)
  if (mentorData?.length !== 3) {
    return undefined
  }

  const scoreData = issueBody.match(SCORE_REGEX)
  if (scoreData?.length !== 3) {
    return undefined
  }

  return {
    mentor: mentorData[2].replace('@', '').trim(),
    score: Number(scoreData[2].trim())
  }
}

export function findSigLabel (labels: LabelQuery[]): LabelQuery | undefined {
  return labels.find((l: LabelQuery) => {
    return l.name.startsWith('sig/')
  })
}

export function isChallengeIssue (labels: LabelQuery[]): boolean {
  const challengeLabel = labels.filter((l: LabelQuery) => {
    return l.name === CHALLENGE_PROGRAM_LABEL
  })
  return challengeLabel.length > 0
}

export function isClosed (issue: IssueQuery): boolean {
  return issue.state === IssueOrPullStatus.Closed
}

// eslint-disable-next-line no-unused-vars
import { LabelQuery } from '../../commands/queries/LabelQuery'

const challengeProgramLabel = 'challenge-program'
const MENTOR_REGEX = /(Mentor).*[\r\n]*[-|* ]*(.*)/
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

  // TODO: we need check if a valid github username.
  const scoreData = issueBody.match(SCORE_REGEX)
  if (scoreData?.length !== 3) {
    return undefined
  }

  return {
    mentor: mentorData[2].replace('@', ''),
    score: Number(scoreData[2])
  }
}

export function findSigLabel (labels: LabelQuery[]): LabelQuery | undefined {
  return labels.find((l: LabelQuery) => {
    return l.name.startsWith('sig/')
  })
}

export function isChallengeIssue (labels: LabelQuery[]): boolean {
  const challengeLabel = labels.filter((l: LabelQuery) => {
    return l.name === challengeProgramLabel
  })
  return challengeLabel.length > 0
}

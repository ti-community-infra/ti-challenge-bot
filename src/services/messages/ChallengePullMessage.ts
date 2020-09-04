/* eslint-disable no-unused-vars */
export enum ChallengePullMessage{
    PullRequestAlreadyClosed = 'This PR already closed!',
    CanNotFindLinkedIssue = 'This PR do not have any linked issue.',
    LinkedNotChallengeIssue = 'This PR haven\'t linked to any scoreable issue.',
    LinkedIssueMissScoreInfo = 'The issue linked to the PR is missing information on the score part.',
    LinkedIssueMissMentorInfo = 'The issue linked to the PR is missing information on the mentor part.',
    NotPicked = 'This PR\'s linked issue is not picked.',
    NotMentor = 'You are not the mentor for the linked issue.',
    NotValidReward = 'Not a valid reward.',
    RewardSuccess = 'Reward success.',
    Rewarded = 'Reward.',
}

export enum ChallengePullTips{
    CanNotFindLinkedIssue= `
    You need to ensure that the link description follows the following template:
    
    Issue Number: #xxx
      
    
About issue link, there is a known [issue](https://github.com/tidb-community-bots/challenge-bot/issues/22).
    `,
    RewardCommandRefs = 'About reward you can refs to [reward-command](https://tidb-community-bots.github.io/challenge-bot/commands.html).'
}

export function rewardScoreInvalidWarning (rewardScore:number, issueScore: number) : string {
  const prefix = `Your reward score is ${rewardScore}, `

  if (rewardScore <= 0) {
    return prefix + 'which is less than or equal to 0.'
  }
  return prefix + `which more than the linked challenge issue's score: ${issueScore}.`
}

export function pullMergedButNotPickedWarning (username: string, mentor?:string|null, currentChallenger?: string|null) {
  return `
The pull request merged, ${username} get the score. But it seems linked issue not picked.

${mentor ? 'cc: Mentor @' + mentor : ''}
${currentChallenger ? 'cc: Current Challenger @' + currentChallenger : ''}
         `
}

export function rewardNotEnoughLeftScoreMessage (leftScore: number) {
  return `The linked issue's balance is not enough, current balance is ${leftScore}.`
}

export function countScoreMessage (username: string, prScore: number, score: number, theme?: string): string {
  return `@${username}, Congratulations, you get ${prScore} in this PR, and your total score is ${score} ` + (theme ? `in ${theme} challenge program.` : 'in challenge program.')
}

export function lgtmNotReward (mentor?: string): string {
  const prefix = 'There is no reward for this challenge pull request, so you can request a reward from '
  if (mentor !== undefined && mentor !== null) {
    return prefix + `@${mentor}.`
  }
  return prefix + 'the mentor.'
}

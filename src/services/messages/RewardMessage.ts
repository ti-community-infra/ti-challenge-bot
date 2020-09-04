/* eslint-disable no-unused-vars */
export enum RewardMessage{
    PullRequestAlreadyClosed = 'This PR already closed!',
    CanNotFindLinkedIssue = 'This PR do not have any linked issue.',
    LinkedNotChallengeIssue = 'This PR haven\'t linked to any scoreable issue.',
    LinkedIssueMissScoreInfo = 'The issue linked to the PR is missing information on the score part.',
    LinkedIssueMissMentorInfo = 'The issue linked to the PR is missing information on the mentor part.',
    NotPicked = 'This PR\'s linked issue is not picked.',
    NotMentor = 'You are not the mentor for the linked issue.',
    NotValidReward = 'Not a valid reward.',
    RewardSuccess = 'Reward success.',
    Rewarded = 'Reward.'
}

export enum RewardTips{
    RewardCommandRefs = 'About reward you can refs to [reward-command](https://tidb-community-bots.github.io/challenge-bot/commands.html).'
}

export function rewardFailedNotEnoughLeftScoreMessage (leftScore: number) {
  return `The linked issue's balance is not enough, current balance is ${leftScore}.`
}

export function lgtmNotReward (mentor?: string): string {
  const prefix = 'There is no reward for this challenge pull request, so you can request a reward from '
  if (mentor !== undefined && mentor !== null) {
    return prefix + `@${mentor}.`
  }
  return prefix + 'the mentor.'
}

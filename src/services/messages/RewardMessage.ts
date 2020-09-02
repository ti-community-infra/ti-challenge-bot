/* eslint-disable no-unused-vars */
export enum RewardMessage{
    PullRequestAlreadyClosed = "This PR already closed!",
    CanNotFindLinkedIssue = 'This PR do not have any linked issue.',
    LinkedNotChallengeIssue = 'This PR haven\'t linked to any scoreable issue.',
    NotPicked = 'This PR\'s linked issue is not picked.',
    NotMentor = 'You are not the mentor for the linked issue.',
    NotValidReward = 'Not a valid reward.',
    RewardSuccess = 'Reward success.'
}

export function rewardFailedNotEnoughLeftScoreMessage (leftScore: number) {
  return `The linked issue's balance is not enough, current balance is ${leftScore}.`
}

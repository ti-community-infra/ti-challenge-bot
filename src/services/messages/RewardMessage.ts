/* eslint-disable no-unused-vars */
export enum RewardMessage{
    PullRequestAlreadyClosed = "This issue already closed!",
    CanNotFindLinkedIssue = 'Can not find any linked challenge issue number!',
    LinkedNotChallengeIssue = 'Your linked issue not a challenge program issue.',
    NotPicked = 'Your linked issue not picked.',
    NotMentor = 'Your not the issue mentor, so you can not reward to this pull request.',
    NotValidReward = 'Not a valid reward.',
    RewardSuccess = 'Reward success.'
}
export function rewardFailedNotEnoughLeftScoreMessage (leftScore: number) {
  return `Reward failed, because this issue left score is ${leftScore}.`
}

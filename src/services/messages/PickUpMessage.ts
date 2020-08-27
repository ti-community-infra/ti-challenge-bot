/* eslint-disable no-unused-vars */
export enum PickUpMessage{
    NotChallengeProgramIssue = 'This issue not a challenge program issue!',
    PickUpSuccess = 'Pickup success.',
    NoSigInfo = 'Can not find any sig info on this issue, please contact the issue author to add sig info label.',
    IllegalSigInfo = 'This issue have a wrong sig info, please contact the issue author to add a correct sig info label.',
    IllegalIssueFormat = 'This issue have a wrong format description, please contact the issue author to modify the issue description.',
}

export function pickUpFailedMessage (reason: string) {
  return `Pickup failed, because ${reason}`
}

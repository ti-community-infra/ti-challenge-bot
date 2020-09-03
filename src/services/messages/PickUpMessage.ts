/* eslint-disable no-unused-vars */
export enum PickUpMessage{
    IssueAlreadyClosed = 'This issue is already closed!',
    NotChallengeProgramIssue = 'It is not a pickable issue!',
    PickUpSuccess = 'Pick up success.',
    NoSigInfo = 'This issue does not belong to any SIG.',
    IllegalSigInfo = 'The SIG information for this issue is wrong.',
    IllegalIssueFormat = 'The desc format for this issue is wrong.',
}

export function alreadyPickedMessage (currentChallenger: string) {
  return `This issue already picked by ${currentChallenger}.`
}

/* eslint-disable no-unused-vars */
export enum PickUpMessage{
    IssueAlreadyClosed = 'This issue is already closed!',
    NotChallengeProgramIssue = 'It is not a pickable issue!',
    PickUpSuccess = 'Pick up success.',
    NoSigInfo = 'This issue does not belong to any SIG.',
    IllegalSigInfo = 'The SIG information for this issue is wrong.',
    IllegalIssueFormat = 'The desc format for this issue is wrong.',
    AddedButMissInfo = 'It has been added to the challenge program, but your issue description has some problems.'
}

export function alreadyPickedMessage (currentChallenger: string) {
  return `This issue already picked by ${currentChallenger}.`
}

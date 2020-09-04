/* eslint-disable no-unused-vars */
export enum PickUpMessage{
    IssueAlreadyClosed = 'This issue is already closed!',
    NotChallengeProgramIssue = 'It is not a pickable issue!',
    PickUpSuccess = 'Pick up success.',
    NoSigInfo = 'This issue does not belong to any SIG.',
    IllegalSigInfo = 'The SIG information for this issue is wrong.',
    IllegalIssueFormat = 'The desc format for this issue is wrong.',
    AddedButMissInfo = 'It has been added to the challenge program, but your issue description has some problems.',
    UpdatedButStillMissInfo = 'The description of issue updated, but still has some problems.',
    Created = 'The challenge issue created.',
    Updated = 'The challenge issue updated.',
    Removed = 'The issue has been removed from the challenge program.',
    CannotRemoveBecausePicked = 'This issue has been picked by someone, so you cannot remove the challenge-program label.',
    CannotRemoveBecauseHasPulls = 'There are already some challenge pull requests for this issue, so you cannot remove the challenge-program label.'
}

export function alreadyPickedMessage (currentChallenger: string) {
  return `This issue already picked by ${currentChallenger}.`
}

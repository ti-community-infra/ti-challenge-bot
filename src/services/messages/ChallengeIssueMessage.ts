/* eslint-disable no-unused-vars */
export enum ChallengeIssueMessage {
  IssueAlreadyClosed = "This issue is already closed!",
  NotChallengeProgramIssue = "It is not a pickable issue!",
  PickUpSuccess = "Pick up success.",
  NoSigInfo = "This issue does not belong to any SIG.",
  NoTeam = "You do not have a team yet, and the current challenge program only supports team participation.",
  AddedButMissInfo = "It has been added to the challenge program, but your issue description has some problems.",
  UpdatedButStillMissInfo = "The description of issue updated, but still has some problems.",
  Created = "The challenge issue created.",
  Updated = "The challenge issue updated.",
  Removed = "The issue has been removed from the challenge program.",
  CannotRemoveBecausePicked = "This issue has been picked by someone, so you cannot remove the challenge-program label.",
  CannotRemoveBecauseHasPulls = "There are already some challenge pull requests for this issue, so you cannot remove the challenge-program label.",
  GiveUpSuccess = "Give up success.",
  NotChallenger = "Give up restricted to the one who already picked the issue.",
  AssignFlowInProcess = "The challenge program issue is already in the assign flow and development has started. So you cannot pick up this issue. You can try other issues.",
}

export enum ChallengeIssueWarning {
  IllegalIssueFormat = "The description format for this issue is wrong.",
  NotAllowedToPickUpAPullRequest = "Picking up a pull request is not allowed.",
  NotAllowedToGiveUpAPullRequest = "Giving up a pull request is not allowed.",
}

export enum ChallengeIssueTip {
  RefineIssueFormat = `
    You need to ensure that the description of the issue follows the following template:
    
    \`\`\`
    ## Score

    - \${score}

    ## Mentor

    - \${mentor}
    \`\`\`
    `,
  AddChallengeProgramLabel = "If you want this issue to be picked, you need to add a `challenge-program` label to it.",
  RefineSigFormat = "Currently, we only support sig labels starting with `sig/`, maybe you should add this type of label.",
}

export function pickUpSuccessMissInfoWarning(author: string): string {
  return `
Pick up success, but the issue miss mentor or score information. 
cc: @${author}
    `;
}

export function alreadyPickedMessage(currentChallenger: string) {
  return `This issue already picked by ${currentChallenger}.`;
}

export function autoGiveUpdMessage(challenger: string, timeout: number) {
  return `@${challenger} You did not submit PR within ${timeout} days, so give up automatically.`;
}

export function assignFlowNeedHelpMessage(mentor: string) {
  return `The challenge program issue is already in the assign flow, so you cannot pick up this issue. But the current issue needs help, you can contact @${mentor} to try to solve this issue together.`;
}

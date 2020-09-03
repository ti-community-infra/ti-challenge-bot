export enum CountMessage {
    // eslint-disable-next-line no-unused-vars
    LinkedIssueNotPicked = 'This PR\'s linked issue is not picked, so you cannot be given a score for this PR'
}

export function countSuccessMessage (username: string, prScore: number, score: number, theme?: string): string {
  return `@${username}, Congratulations, you get ${prScore} in this PR, and your total score is ${score} ` + (theme ? `in ${theme} challenge program.` : 'in challenge program.')
}

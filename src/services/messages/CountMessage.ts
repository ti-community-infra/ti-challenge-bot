export function countFailedMessage (username: string): string {
  return `@${username}, because the linked challenge issue challenger not you, so you can not this score!`
}

export function countSuccessMessage (username: string, score: number): string {
  return `@${username},Current you score is ${score}.`
}

export function countSuccessMessageWithTheme (username: string, score: number, theme: string): string {
  return `@${username},Current you score is ${score} in ${theme} challenge program.`
}

export function countFailedMessage (username: string): string {
  return `@${username}, because the linked challenge issue challenger not you, so you can not this score!`
}

export function countSuccessMessage (usename: string, score: number): string {
  return `@${usename},Current you score is ${score}.`
}

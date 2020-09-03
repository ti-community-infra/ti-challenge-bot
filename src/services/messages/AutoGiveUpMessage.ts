export function autoGiveUpdMessage (challenger: string, timeout: number) {
  return `@${challenger} You did not submit PR within ${timeout} days, so give up automatically.`
}

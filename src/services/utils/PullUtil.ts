const ISSUE_NUMBER_REGEX = /(Issue Number:).*#([0-9]*)/;

export function findLinkedIssueNumber(pullBody: string): number | undefined {
  const issueNumberData = pullBody.match(ISSUE_NUMBER_REGEX);
  if (issueNumberData?.length !== 3) {
    return undefined;
  }

  return Number(issueNumberData[2]);
}

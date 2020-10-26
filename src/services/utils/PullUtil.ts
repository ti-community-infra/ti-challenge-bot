const ISSUE_NUMBER_REGEX = /(Issue Number:).*#([0-9]*)/;

export function findLinkedIssueNumber(pullBody: string): number | null {
  const issueNumberData = pullBody.match(ISSUE_NUMBER_REGEX);
  if (issueNumberData?.length !== 3) {
    return null;
  }

  return Number(issueNumberData[2]);
}

export function isValidBranch(branches: string[], baseRef: string) {
  const branchesSet = new Set(branches);

  return branchesSet.has(baseRef);
}

const ISSUE_NUMBER_REGEX = /(Issue Number:).*#([0-9]*)/;
const ISSUE_URL_REGEX = /(Issue Number:).*https:\/\/github.com\/.*\/.*\/issues\/([0-9]*)/;

export function findLinkedIssueNumber(pullBody: string | null): number | null {
  if (pullBody === null) {
    return null;
  }

  const issueNumberData =
    pullBody.match(ISSUE_NUMBER_REGEX) || pullBody.match(ISSUE_URL_REGEX);
  if (issueNumberData?.length !== 3) {
    return null;
  }

  return Number(issueNumberData[2]);
}

export function isValidBranch(branches: string[], baseRef: string) {
  const branchesSet = new Set(branches);

  return branchesSet.has(baseRef);
}

const ISSUE_NUMBER_REGEX = /(Issue Number:)\s*(close)?\s*#([0-9]*)/;
const ISSUE_URL_REGEX = /(Issue Number:)\s*(close)?\s*https:\/\/github.com\/.*\/.*\/issues\/([0-9]*)/;

/**
 * findLinkedIssueNumber
 * @param pullBody
 * @return issueNumber
 * @return containsClose
 */
export function findLinkedIssueNumber(pullBody: string) {
  const issueNumberData =
    pullBody.match(ISSUE_NUMBER_REGEX) || pullBody.match(ISSUE_URL_REGEX);
  if (issueNumberData?.length !== 4) {
    return [null, null];
  }
  return [Number(issueNumberData[3]), issueNumberData[2] === "close"];
}

export function isValidBranch(branches: string[], baseRef: string) {
  const branchesSet = new Set(branches);

  return branchesSet.has(baseRef);
}

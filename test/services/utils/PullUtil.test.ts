import {
  findLinkedIssueNumber,
  isValidBranch,
} from "../../../src/services/utils/PullUtil";

describe("Pull Util", () => {
  test("found linked issue", () => {
    const cases: [string, number][] = [
      ["Issue Number: #100", 100],
      [
        `
        tidb
        tikv
        pd
        ...
        ...
        Issue Number: #200
        `,
        200,
      ],
    ];

    cases.forEach((c) => {
      expect(findLinkedIssueNumber(c[0])).toBe(c[1]);
    });
  });

  test("linked issue could not be found", () => {
    const cases: [string, null][] = [
      ["Issue Number: 100", null],
      [
        `
        tidb
        tikv
        pd
        ...
        ...
        Issue Number #200
        `,
        null,
      ],
    ];

    cases.forEach((c) => {
      expect(findLinkedIssueNumber(c[0])).toBe(c[1]);
    });
  });

  test("is valid branch", () => {
    const cases: [string[], string, boolean][] = [
      [["master", "main"], "master", true],
      [["master", "main", "release"], "test", false],
    ];

    cases.forEach((c) => {
      expect(isValidBranch(c[0], c[1])).toBe(c[2]);
    });
  });
});

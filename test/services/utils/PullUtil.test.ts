import {
  findLinkedIssueNumber,
  isValidBranch,
} from "../../../src/services/utils/PullUtil";

describe("Pull Util", () => {
  test("found linked issue", () => {
    const cases: (string | (number | boolean)[])[][] = [
      ["Issue Number: #100", [100, false]],
      [
        `
        tidb
        tikv
        pd
        ...
        ...
        Issue Number: #200
        `,
        [200, false],
      ],
      [
        "Issue Number: https://github.com/test/test/issues/19971",
        [19971, false],
      ],
      [
        "Issue Number: close https://github.com/test/test/issues/19971",
        [19971, true],
      ],
    ];

    cases.forEach((c) => {
      expect(findLinkedIssueNumber(String(c[0]))).toEqual(c[1]);
    });
  });

  test("linked issue could not be found", () => {
    const cases: (string | null[])[][] = [
      ["Issue Number: 100", [null, null]],
      [
        `
        tidb
        tikv
        pd
        ...
        ...
        Issue Number #200
        `,
        [null, null],
      ],
    ];

    cases.forEach((c) => {
      expect(findLinkedIssueNumber(String(c[0]))).toEqual(c[1]);
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

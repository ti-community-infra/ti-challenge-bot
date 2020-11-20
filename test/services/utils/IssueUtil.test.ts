import {
  findSigLabel,
  isChallengeIssue,
  needHelp,
  checkIsInAssignFlow,
  isClosed,
  findMentorAndScore,
} from "../../../src/services/utils/IssueUtil";
import {
  CHALLENGE_PROGRAM_LABEL,
  HELP_WANTED_LABEL,
} from "../../../src/commands/labels";

describe("Issue Util", () => {
  test("issue have sig label", () => {
    expect(
      findSigLabel([
        {
          id: 1,
          name: "sig/execution",
          description: "SIG: execution",
          default: false,
        },
        {
          id: 2,
          name: "plan/document",
          description: "document",
          default: false,
        },
      ])
    ).toEqual({
      id: 1,
      name: "sig/execution",
      description: "SIG: execution",
      default: false,
    });
  });

  test("have challenge-program label", () => {
    expect(
      isChallengeIssue([
        {
          id: 1,
          name: CHALLENGE_PROGRAM_LABEL,
          description: "challenge program",
          default: false,
        },
        {
          id: 2,
          name: "sig/execution",
          description: "SIG: execution",
          default: true,
        },
      ])
    ).toBe(true);
  });

  test("have not challenge-program label", () => {
    expect(
      isChallengeIssue([
        {
          id: 2,
          name: "sig/execution",
          description: "SIG: execution",
          default: true,
        },
      ])
    ).toBe(false);
  });

  test("haven not need-help label", () => {
    expect(
      needHelp([
        {
          id: 2,
          name: "challenge-program",
          description: "challenge program",
          default: false,
        },
      ])
    ).toBe(false);
  });

  test("have need-help label", () => {
    expect(
      needHelp([
        {
          id: 1,
          name: HELP_WANTED_LABEL,
          description: "status：help-wanted",
          default: false,
        },
      ])
    ).toBe(true);
  });

  test("found in assignees", () => {
    expect(
      checkIsInAssignFlow(
        [
          {
            login: "bot1",
            id: 1,
            type: "string",
          },
          {
            login: "bot2",
            id: 2,
            type: "string",
          },
        ],
        "bot2"
      )
    ).toBe(true);
  });

  test("not found in assignees", () => {
    expect(
      checkIsInAssignFlow(
        [
          {
            login: "bot1",
            id: 1,
            type: "string",
          },
          {
            login: "bot2",
            id: 2,
            type: "string",
          },
        ],
        "bot3"
      )
    ).toBe(false);
  });

  test("issue is closed", () => {
    expect(
      isClosed({
        id: 1,
        url: "https://pingcap.com/",
        number: 1,
        state: "closed",
        title: "test",
        body: "test content",
        user: {
          login: "user",
          id: 1,
          type: "user",
        },
        labels: [],
        closedAt: "2020-11-20",
        createdAt: "2020-11-20",
        updatedAt: "2020-11-20",
        authorAssociation: "test",
        assignees: [],
      })
    ).toBe(true);
  });

  test("issue is open", () => {
    expect(
      isClosed({
        id: 1,
        url: "https://pingcap.com/",
        number: 1,
        state: "open",
        title: "test",
        body: "test content",
        user: {
          login: "user",
          id: 1,
          type: "user",
        },
        labels: [],
        closedAt: "2020-11-20",
        createdAt: "2020-11-20",
        updatedAt: "2020-11-20",
        authorAssociation: "test",
        assignees: [],
      })
    ).toBe(false);
  });

  test("isuue content have mentor and score", () => {
    let text = `Score
    300
    Mentor
    @lzmhhh123`;

    expect(findMentorAndScore(text)).toEqual({
      mentor: "lzmhhh123",
      score: 300,
    });
  });

  test("isuue content haven't mentor", () => {
    let text = `Score
    300
    Mentor`;

    expect(findMentorAndScore(text)).toBeUndefined();
  });

  test("isuue content haven't score", () => {
    let text = `Score

    Mentor
    @lzmhhh123`;

    expect(findMentorAndScore(text)).toBeUndefined();
  });
});

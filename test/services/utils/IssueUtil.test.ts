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
  test("sig label can be found", () => {
    const sigLabel = findSigLabel([
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
    ]);

    expect(sigLabel).toEqual({
      id: 1,
      name: "sig/execution",
      description: "SIG: execution",
      default: false,
    });
  });

  test("challenge-program label can be found", () => {
    const issueLabels = [
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
    ];

    expect(isChallengeIssue(issueLabels)).toBe(true);
  });

  test("challenge-program label can not be found", () => {
    const issueLabels = [
      {
        id: 2,
        name: "sig/execution",
        description: "SIG: execution",
        default: true,
      },
    ];

    expect(isChallengeIssue(issueLabels)).toBe(false);
  });

  test("need-help label can not be found", () => {
    const issueLabels = [
      {
        id: 2,
        name: "challenge-program",
        description: "challenge program",
        default: false,
      },
    ];

    expect(needHelp(issueLabels)).toBe(false);
  });

  test("need-help label can be found", () => {
    const issueLabels = [
      {
        id: 1,
        name: HELP_WANTED_LABEL,
        description: "status：help-wanted",
        default: false,
      },
    ];

    expect(needHelp(issueLabels)).toBe(true);
  });

  test("mentor can be found in the assignees", () => {
    const assignees = [
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
    ];

    expect(checkIsInAssignFlow(assignees, "bot2")).toBe(true);
  });

  test("mentor can not be found in the assignees", () => {
    const assignees = [
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
    ];

    expect(checkIsInAssignFlow(assignees, "bot3")).toBe(false);
  });

  test("issue is closed", () => {
    const closedIssue = {
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
    };

    expect(isClosed(closedIssue)).toBe(true);
  });

  test("issue is open", () => {
    const openedIssue = {
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
    };

    expect(isClosed(openedIssue)).toBe(false);
  });

  test("mentor and score both can be found in the issue content", () => {
    const issueContent = `Score
    300
    Mentor
    @lzmhhh123`;
    const expectMentorAndScore = {
      mentor: "lzmhhh123",
      score: 300,
    };

    expect(findMentorAndScore(issueContent)).toEqual(expectMentorAndScore);
  });

  test("mentor can not be found in the issue content", () => {
    let issueContent = `Score
    300
    Mentor`;

    expect(findMentorAndScore(issueContent)).toBeUndefined();
  });

  test("score can not be found in the issue content", () => {
    let issueContent = `Score

    Mentor
    @lzmhhh123`;

    expect(findMentorAndScore(issueContent)).toBeUndefined();
  });
});

import { LabelQuery } from "../../queries/LabelQuery";

import { IssueQuery } from "../../queries/IssueQuery";
import { IssueOrPullStatus } from "../../repositoies/score";
import {
  CHALLENGE_PROGRAM_LABEL,
  HELP_WANTED_LABEL,
} from "../../commands/labels";
import { UserQuery } from "../../queries/UserQuery";

const MENTOR_REGEX = /(Mentor).*[\r\n]+[-|* ]*[@]*([a-z0-9](?:-?[a-z0-9]){0,38})/i;
const SCORE_REGEX = /(Score).*[\r\n]+[-|* ]*([1-9]+[0-9]*)/;

export interface MentorAndScore {
  mentor: string;
  score: number;
}

export function findMentorAndScore(
  issueBody: string
): MentorAndScore | undefined {
  const mentorData = issueBody.match(MENTOR_REGEX);
  if (mentorData?.length !== 3) {
    return undefined;
  }

  const scoreData = issueBody.match(SCORE_REGEX);
  if (scoreData?.length !== 3) {
    return undefined;
  }

  return {
    mentor: mentorData[2].replace("@", "").trim(),
    score: Number(scoreData[2]),
  };
}

export function findSigLabel(labels: LabelQuery[]): LabelQuery | undefined {
  return labels.find((l: LabelQuery) => {
    return l.name?.startsWith("sig/");
  });
}

export function isChallengeIssue(labels: LabelQuery[]): boolean {
  const challengeLabel = labels.filter((l: LabelQuery) => {
    return l.name === CHALLENGE_PROGRAM_LABEL;
  });
  return challengeLabel.length > 0;
}

export function needHelp(labels: LabelQuery[]): boolean {
  return labels
    .map((l) => {
      return l.name;
    })
    .includes(HELP_WANTED_LABEL);
}

export function isClosed(issue: IssueQuery): boolean {
  return issue.state === IssueOrPullStatus.Closed;
}

export function checkIsInAssignFlow(
  assignees: UserQuery[],
  mentor: string
): boolean {
  let hasMentor = false;

  assignees.forEach((a) => {
    if (a.login === mentor) {
      hasMentor = true;
    }
  });

  return hasMentor;
}

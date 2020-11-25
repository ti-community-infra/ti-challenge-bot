import { UserQuery } from "./UserQuery";

import { LabelQuery } from "./LabelQuery";

export interface IssueQuery {
  id: number;
  url: string;
  number: number;
  state: string;
  title: string;
  body: string;
  user: UserQuery;
  labels: Array<LabelQuery>;
  closedAt: string;
  createdAt: string;
  updatedAt: string;
  authorAssociation: string;
  isPullRequest: boolean;
  // TODO: check all places to add this value.
  assignees: UserQuery[];
}

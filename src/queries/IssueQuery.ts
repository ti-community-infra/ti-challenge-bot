import { UserQuery } from "./UserQuery";

import { LabelQuery } from "./LabelQuery";

export interface IssueQuery {
  id: number;
  url: string;
  number: number;
  state: string;
  title: string;
  body?: string;
  user: UserQuery | null;
  labels: Array<LabelQuery>;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  authorAssociation: string;
  // TODO: check all places to add this value.
  assignees?: (UserQuery | null)[] | null;
}

import { LabelQuery } from "./LabelQuery";

import { UserQuery } from "./UserQuery";

export interface PullQuery {
  id: number;
  number: number;
  state: string;
  title: string;
  user: UserQuery;
  body: string;
  labels: Array<LabelQuery>;
  createdAt: string;
  updatedAt: string;
  closedAt: string;
  mergedAt: string;
  authorAssociation: string;
}

import { LabelQuery } from "./LabelQuery";

import { UserQuery } from "./UserQuery";

export interface PullQuery {
  id: number;
  number: number;
  state: string;
  title: string;
  user: UserQuery | null;
  body: string | null;
  labels: Array<LabelQuery>;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  mergedAt: string | null;
  authorAssociation: string;
}

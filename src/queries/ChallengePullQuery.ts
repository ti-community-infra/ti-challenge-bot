import { PullQuery } from "./PullQuery";

export interface ChallengePullQuery {
  owner: string;
  repo: string;
  pull: PullQuery;
}

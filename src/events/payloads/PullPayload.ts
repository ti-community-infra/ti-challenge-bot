import { PullQuery } from "../../queries/PullQuery";

export interface PullPayload {
  action: string;
  owner: string;
  repo: string;
  number: number;
  pull: PullQuery;
}

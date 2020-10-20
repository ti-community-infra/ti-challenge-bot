import { IssueQuery } from "../../queries/IssueQuery";

export interface IssuePayload {
  action: string;
  number: number;
  owner: string;
  repo: string;
  issue: IssueQuery;
}

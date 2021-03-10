import { LabelQuery } from "./LabelQuery";

export interface GiveUpQuery {
  challenger: string;
  owner: string;
  repo: string;
  issueNumber: number;
  labels: LabelQuery[];
}

import { LabelQuery } from "./LabelQuery";

export interface GiveUpQuery {
  challenger: string;
  issueId: number;
  labels: LabelQuery[];
}

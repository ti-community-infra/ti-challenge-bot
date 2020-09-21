// eslint-disable-next-line no-unused-vars
import { IssueQuery } from './IssueQuery'

export interface ChallengeIssueQuery{
    owner: string;
    repo: string;
    defaultSigLabel?: string;
    issue: IssueQuery;
}

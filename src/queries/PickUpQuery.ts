// eslint-disable-next-line no-unused-vars
import { IssueQuery } from './IssueQuery'

export interface PickUpQuery{
    challenger: string;
    owner:string;
    repo: string;
    issue:IssueQuery;
    defaultSigLabel?: string
}

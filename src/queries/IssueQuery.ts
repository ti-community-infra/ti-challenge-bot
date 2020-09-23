// eslint-disable-next-line no-unused-vars
import { UserQuery } from './UserQuery'
// eslint-disable-next-line no-unused-vars
import { LabelQuery } from './LabelQuery'

export interface IssueQuery{
    id: number;
    url: string;
    number: number;
    state: string;
    title: string;
    body: string;
    user: UserQuery;
    labels: Array<LabelQuery>;
    closedAt: string;
    createdAt: string;
    updatedAt: string;
    authorAssociation: string;
    // TODO: check all places to add this value.
    assignees: UserQuery[]
}

// eslint-disable-next-line no-unused-vars
import { PullQuery } from './PullQuery'
import { UserQuery } from './UserQuery'

export interface RewardQuery{
    mentor: string;
    owner:string;
    repo: string;
    pull: PullQuery;
    reward: number;
    linkedIssueNumber: number;
    issueAssignees: UserQuery[];
}

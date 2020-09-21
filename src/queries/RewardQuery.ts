// eslint-disable-next-line no-unused-vars
import { PullQuery } from './PullQuery'

export interface RewardQuery{
    mentor: string;
    owner:string;
    repo: string;
    pull: PullQuery;
    reward: number,
}

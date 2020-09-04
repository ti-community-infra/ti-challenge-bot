// eslint-disable-next-line no-unused-vars
import { PullQuery } from './PullQuery'

export interface ChallengePullQuery{
    owner:string;
    repo: string;
    pull: PullQuery;
}

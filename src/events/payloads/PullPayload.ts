// eslint-disable-next-line no-unused-vars
import { PullQuery } from '../../commands/queries/PullQuery'

export interface PullPayload{
    action: string;
    number: number;
    pull: PullQuery;
}

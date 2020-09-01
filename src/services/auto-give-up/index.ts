import {Service} from "typedi";
import {AutoGiveUpQuery} from "../../commands/queries/AutoGiveUpQuery";
import {InjectRepository} from "typeorm-typedi-extensions";
import {Repository} from "typeorm/repository/Repository";
import {ChallengeIssue} from "../../db/entities/ChallengeIssue";

interface AutoGiveUpMessage{
    owner: string;
    repo: string;
    number: number;
    message: string;
}

@Service()
export default class AutoGiveUpService {

    // eslint-disable-next-line no-useless-constructor
    constructor(
        @InjectRepository(ChallengeIssue)
        private challengeIssueRepository: Repository<ChallengeIssue>
    ) {
    }

    // FIXME: need check the date.
    private async findAllNonePullChallengeIssues(autoGiveUpQuery: AutoGiveUpQuery): Promise<ChallengeIssue[]>{
        const challengeIssues = await this.challengeIssueRepository.createQueryBuilder('ci')
            .leftJoinAndSelect("ci.issue", "issue")
            .where("issue.owner = :owner and issue.repo = :repo", {...autoGiveUpQuery})
            .leftJoinAndSelect("ci.challengePulls","challengePulls")
            .getMany()

        return challengeIssues.filter(c=>{
            return c.challengePulls.length === 0
        })
    }

    public async autoGiveUp(autoGiveUpQuery: AutoGiveUpQuery): Promise<AutoGiveUpMessage[]> {
        const result: AutoGiveUpMessage[] = []
        const challengeIssues = await this.findAllNonePullChallengeIssues(autoGiveUpQuery)

        challengeIssues.forEach(c => {
            result.push({
                ...autoGiveUpQuery,
                number: c.issue.issueNumber,
                message: `@${c.currentChallengerGitHubId}You did not submit PR within 7 days, so give up automatically.`
            })
            c.hasPicked = false
            c.currentChallengerGitHubId = null
            c.pickedAt = null
            this.challengeIssueRepository.save(c)
        })

        return result
    }
}

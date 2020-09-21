import { Service } from 'typedi'
// eslint-disable-next-line no-unused-vars
import { AutoGiveUpQuery } from '../../queries/AutoGiveUpQuery'
import { InjectRepository } from 'typeorm-typedi-extensions'
// eslint-disable-next-line no-unused-vars
import { Repository } from 'typeorm/repository/Repository'
import { ChallengeIssue } from '../../db/entities/ChallengeIssue'
import { DEFAULT_TIMEOUT } from '../../config/Config'
import { autoGiveUpdMessage } from '../messages/ChallengeIssueMessage'

interface AutoGiveUpResult {
    owner: string;
    repo: string;
    number: number;
    message: string;
}

@Service()
export default class AutoGiveUpService {
  // eslint-disable-next-line no-useless-constructor
  constructor (
        @InjectRepository(ChallengeIssue)
        private challengeIssueRepository: Repository<ChallengeIssue>
  ) {
  }

  private static isTimeout (pickedAt: string, timeout: number): boolean {
    return (new Date().valueOf() - Date.parse(pickedAt)) > timeout * 24 * 60 * 60 * 1000
  }

  private async findAllNonePullChallengeIssues (autoGiveUpQuery: AutoGiveUpQuery): Promise<ChallengeIssue[]> {
    const challengeIssues = await this.challengeIssueRepository.createQueryBuilder('ci')
      .leftJoinAndSelect('ci.issue', 'issue')
      .where('issue.owner = :owner and issue.repo = :repo and ci.has_picked = 1', { ...autoGiveUpQuery })
      .leftJoinAndSelect('ci.challengePulls', 'challengePulls')
      .getMany()

    return challengeIssues.filter(c => {
      const { pickedAt } = c
      return pickedAt && c.challengePulls && c.challengePulls.length === 0 && AutoGiveUpService.isTimeout(pickedAt, autoGiveUpQuery.timeout || DEFAULT_TIMEOUT)
    })
  }

  public async autoGiveUp (autoGiveUpQuery: AutoGiveUpQuery): Promise<AutoGiveUpResult[]> {
    const result: AutoGiveUpResult[] = []
    const challengeIssues = await this.findAllNonePullChallengeIssues(autoGiveUpQuery)

    challengeIssues.forEach(c => {
      if (c.currentChallengerGitHubId) {
        result.push({
          ...autoGiveUpQuery,
          number: c.issue.issueNumber,
          message: autoGiveUpdMessage(c.currentChallengerGitHubId, autoGiveUpQuery.timeout || DEFAULT_TIMEOUT)
        })
      }
      c.hasPicked = false
      c.currentChallengerGitHubId = null
      c.pickedAt = null
      this.challengeIssueRepository.save(c)
    })

    return result
  }
}

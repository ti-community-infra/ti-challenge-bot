import { Service } from 'typedi'
import { InjectRepository } from 'typeorm-typedi-extensions'
// eslint-disable-next-line no-unused-vars
import { Repository } from 'typeorm/repository/Repository'

import { Pull } from '../../db/entities/Pull'
// eslint-disable-next-line no-unused-vars
import { PullPayload } from '../../events/payloads/PullPayload'
// eslint-disable-next-line no-unused-vars
import { Response, Status } from '../responses'
import { findLinkedIssueNumber } from '../utils/PullUtil'
import { Issue } from '../../db/entities/Issue'
// eslint-disable-next-line no-unused-vars
import { LabelQuery } from '../../commands/queries/LabelQuery'
import { ChallengeIssue } from '../../db/entities/ChallengeIssue'
import { ChallengePull } from '../../db/entities/ChallengePull'
import { countFailedNotChallengerMessage, countSuccessMessage, countSuccessMessageWithTheme } from '../messages/CountMessage'
import { ChallengeProgram } from '../../db/entities/ChallengeProgram'

enum PullStatus {
  // eslint-disable-next-line no-unused-vars
  Open = 'open',
  // eslint-disable-next-line no-unused-vars
  Closed = 'closed',
  // eslint-disable-next-line no-unused-vars
  Merged = 'merged'
}

@Service()
export default class CountService {
  // eslint-disable-next-line no-useless-constructor
  constructor (
        @InjectRepository(Issue)
        private issueRepository: Repository<Issue>,
        @InjectRepository(Pull)
        private pullRepository: Repository<Pull>,
        @InjectRepository(ChallengeIssue)
        private challengeIssueRepository: Repository<ChallengeIssue>
  ) {
  }

  private async countScoreInProgram (theme: string, username: string): Promise<number> {
    const { score } = await this.challengeIssueRepository.createQueryBuilder('ci')
      .leftJoinAndSelect(ChallengeProgram, 'cpg', 'ci.challenge_program_id = cpg.id')
      .leftJoinAndSelect(ChallengePull, 'cp', ' ci.issue_id = cp.challenge_issue_id')
      .leftJoinAndSelect(Pull, 'p', 'cp.pull_id = p.id')
      .where(`cpg.program_theme = '${theme}' and ci.current_challenger_github_id = '${username}' and p.status = '${PullStatus.Merged}'`)
      .select('sum(cp.reward)', 'score')
      .getRawOne()

    return score
  }

  private async countScoreInLongTermProgram (username:string): Promise<number> {
    const { score } = await this.challengeIssueRepository.createQueryBuilder('ci').leftJoinAndSelect(ChallengePull, 'cp', ' ci.issue_id = cp.challenge_issue_id')
      .leftJoinAndSelect(Pull, 'p', 'cp.pull_id = p.id')
      .where(`ci.challenge_program_id is null and ci.current_challenger_github_id = '${username}' and p.status = '${PullStatus.Merged}'`)
      .select('sum(cp.reward)', 'score')
      .getRawOne()

    return score
  }

  public async count (pullPayload: PullPayload): Promise<Response<number|null> | undefined> {
    const { pull: pullQuery } = pullPayload

    const pull = await this.pullRepository.findOne({
      where: {
        pullNumber: pullPayload.number
      }
    })

    // Can not find the pull it means this pull request not reward, so we do not need to count this.
    // FIXME: maybe we should add this pull.
    if (pull === undefined) {
      return
    }

    // Can not find linked issue.
    const issueNumber = findLinkedIssueNumber(pullQuery.body)
    if (issueNumber === undefined) {
      return
    }

    // Can not find issue or challenge issue info.
    const issue = await this.issueRepository.findOne({
      relations: ['challengeIssue', 'challengeIssue.challengeProgram'],
      where: {
        issueNumber
      }
    })

    if (issue === undefined || issue.challengeIssue === undefined) {
      return
    }

    // Not challenger or not picked.
    const { login: username } = pullQuery.user
    const { challengeIssue } = issue
    if (!challengeIssue.hasPicked || challengeIssue.currentChallengerGitHubId !== username) {
      return {
        data: null,
        status: Status.Failed,
        message: countFailedNotChallengerMessage(username)
      }
    }

    // Update pull info.
    pull.title = pullQuery.title
    pull.body = pullQuery.body
    pull.label = pullQuery.labels.map((l:LabelQuery) => {
      return l.name
    }).join(',')
    pull.status = PullStatus.Merged
    pull.updatedAt = pullQuery.updatedAt
    pull.closedAt = pullQuery.closedAt
    pull.mergedAt = pullQuery.mergedAt
    await this.pullRepository.save(pull)

    // Count the score.
    const { challengeProgram } = challengeIssue

    if (challengeProgram) {
      const score = await this.countScoreInProgram(challengeProgram.programTheme, username)
      return {
        data: score,
        status: Status.Success,
        message: countSuccessMessageWithTheme(username, score, challengeProgram.programTheme)
      }
    } else {
      const score = await this.countScoreInLongTermProgram(username)
      return {
        data: score,
        status: Status.Success,
        message: countSuccessMessage(username, score)
      }
    }
  }
}

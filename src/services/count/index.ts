import { Service } from 'typedi'
import { InjectRepository } from 'typeorm-typedi-extensions'
// eslint-disable-next-line no-unused-vars
import { Repository } from 'typeorm/repository/Repository'

import { Pull } from '../../db/entities/Pull'
// eslint-disable-next-line no-unused-vars
import { PullPayload } from '../../events/payloads/PullPayload'
// eslint-disable-next-line no-unused-vars
import { Reply, Status } from '../reply'
import { findLinkedIssueNumber } from '../utils/PullUtil'
import { Issue } from '../../db/entities/Issue'
// eslint-disable-next-line no-unused-vars
import { LabelQuery } from '../../commands/queries/LabelQuery'
import { CountMessage, countSuccessMessage } from '../messages/CountMessage'
// eslint-disable-next-line no-unused-vars
import ScoreRepository, { IssueOrPullStatus } from '../../repositoies/score'

@Service()
export default class CountService {
  // eslint-disable-next-line no-useless-constructor
  constructor (
        @InjectRepository(Issue)
        private issueRepository: Repository<Issue>,
        @InjectRepository(Pull)
        private pullRepository: Repository<Pull>,
        @InjectRepository()
        private scoreRepository: ScoreRepository
  ) {
  }

  public async count (pullPayload: PullPayload): Promise<Reply<number|null> | undefined> {
    const { pull: pullQuery } = pullPayload

    const pull = await this.pullRepository.findOne({
      relations: ['challengePull'],
      where: {
        pullNumber: pullPayload.number
      }
    })

    // Can not find the pull it means this pull request not reward, so we do not need to count this.
    // FIXME: maybe we should add this pull.
    if (pull === undefined || pull.challengePull === undefined || pull.challengePull === null) {
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

    if (issue === undefined || issue.challengeIssue === undefined || issue.challengeIssue === null) {
      return
    }

    // Not picked.
    const { login: username } = pullQuery.user
    const { challengeIssue } = issue
    if (!challengeIssue.hasPicked) {
      return {
        data: null,
        status: Status.Failed,
        message: CountMessage.LinkedIssueNotPicked
      }
    }

    // Update pull info.
    pull.title = pullQuery.title
    pull.body = pullQuery.body
    pull.label = pullQuery.labels.map((l:LabelQuery) => {
      return l.name
    }).join(',')
    pull.status = IssueOrPullStatus.Merged
    pull.updatedAt = pullQuery.updatedAt
    pull.closedAt = pullQuery.closedAt
    pull.mergedAt = pullQuery.mergedAt
    await this.pullRepository.save(pull)

    // Count the score.
    const { challengeProgram } = challengeIssue

    if (challengeProgram !== undefined && challengeProgram !== null) {
      const score = await this.scoreRepository.getCurrentScoreInProgram(challengeProgram.programTheme, username)
      return {
        data: score,
        status: Status.Success,
        message: countSuccessMessage(username, pull.challengePull.reward, score, challengeProgram.programTheme)
      }
    } else {
      const score = await this.scoreRepository.getCurrentScoreInLongTermProgram(username)
      return {
        data: score,
        status: Status.Success,
        message: countSuccessMessage(username, pull.challengePull.reward, score)
      }
    }
  }
}

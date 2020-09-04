import { Service } from 'typedi'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { Issue } from '../../db/entities/Issue'
// eslint-disable-next-line no-unused-vars
import { Repository } from 'typeorm/repository/Repository'
import { ChallengePull } from '../../db/entities/ChallengePull'
import { Pull } from '../../db/entities/Pull'
// eslint-disable-next-line no-unused-vars
import ScoreRepository, { IssueOrPullStatus } from '../../repositoies/score'
// eslint-disable-next-line no-unused-vars
import { RewardQuery } from '../../commands/queries/RewardQuery'
// eslint-disable-next-line no-unused-vars
import { LabelQuery } from '../../commands/queries/LabelQuery'
// eslint-disable-next-line no-unused-vars
import { Reply, Status } from '../reply'
import { rewardFailedNotEnoughLeftScoreMessage, RewardMessage } from '../messages/RewardMessage'
import { findLinkedIssueNumber } from '../utils/PullUtil'
// eslint-disable-next-line no-unused-vars
import { PullPayload } from '../../events/payloads/PullPayload'
import { CountMessage, countSuccessMessage } from '../messages/CountMessage'

@Service()
export default class ChallengePullService {
  // eslint-disable-next-line no-useless-constructor
  constructor (
        @InjectRepository(Issue)
        private issueRepository: Repository<Issue>,
        @InjectRepository(ChallengePull)
        private challengePullRepository: Repository<ChallengePull>,
        @InjectRepository(Pull)
        private pullRepository: Repository<Pull>,
        @InjectRepository()
        private scoreRepository: ScoreRepository
  ) {
  }

  private async findOrCreatePull (rewardQuery: RewardQuery): Promise<Pull> {
    const { pull: pullQuery } = rewardQuery

    let pull = await this.pullRepository.findOne({
      relations: ['challengePull'],
      where: {
        pullNumber: pullQuery.number
      }
    })

    if (pull === undefined) {
      const newPull = new Pull()
      newPull.owner = rewardQuery.owner
      newPull.repo = rewardQuery.repo
      newPull.pullNumber = pullQuery.number
      newPull.title = pullQuery.title
      newPull.body = pullQuery.body
      newPull.user = pullQuery.user.login
      // FIXME: add relations.
      newPull.association = pullQuery.authorAssociation
      newPull.label = pullQuery.labels.map((l:LabelQuery) => {
        return l.name
      }).join(',')
      newPull.status = pullQuery.state
      newPull.updatedAt = pullQuery.updatedAt
      newPull.closedAt = pullQuery.closedAt
      pull = await this.pullRepository.save(newPull)
    }

    return pull
  }

  public async reward (rewardQuery: RewardQuery): Promise<Reply<number|null>> {
    const { pull: pullQuery } = rewardQuery
    const baseFailedMessage = {
      data: null,
      status: Status.Failed
    }

    if (pullQuery.state === IssueOrPullStatus.Closed) {
      return {
        ...baseFailedMessage,
        message: RewardMessage.PullRequestAlreadyClosed
      }
    }

    const issueNumber = findLinkedIssueNumber(pullQuery.body)
    if (issueNumber === undefined) {
      return {
        ...baseFailedMessage,
        message: RewardMessage.CanNotFindLinkedIssue
      }
    }

    const issue = await this.issueRepository.findOne({
      relations: ['challengeIssue'],
      where: {
        issueNumber
      }
    })

    if (issue === undefined || issue.challengeIssue === undefined || issue.challengeIssue === null) {
      return {
        ...baseFailedMessage,
        message: RewardMessage.LinkedNotChallengeIssue
      }
    }

    const { challengeIssue } = issue
    if (!challengeIssue.hasPicked) {
      return {
        ...baseFailedMessage,
        message: RewardMessage.NotPicked
      }
    }

    if (challengeIssue.mentor === undefined || challengeIssue.mentor === null) {
      return {
        ...baseFailedMessage,
        message: RewardMessage.LinkedIssueMissMentorInfo
      }
    }

    if (rewardQuery.mentor !== challengeIssue.mentor) {
      return {
        ...baseFailedMessage,
        message: RewardMessage.NotMentor
      }
    }

    if (challengeIssue.score === null || challengeIssue.score === undefined) {
      return {
        ...baseFailedMessage,
        message: RewardMessage.LinkedIssueMissScoreInfo
      }
    }

    if (rewardQuery.reward < 0 || rewardQuery.reward > challengeIssue.score) {
      return {
        ...baseFailedMessage,
        message: RewardMessage.NotValidReward
      }
    }

    const pull = await this.findOrCreatePull(rewardQuery)

    const currentLeftScore = await this.scoreRepository.getCurrentLeftScore(challengeIssue, pull.id)
    if (currentLeftScore === null) {
      return {
        ...baseFailedMessage,
        message: RewardMessage.LinkedIssueMissScoreInfo
      }
    }

    if (rewardQuery.reward > currentLeftScore) {
      return {
        ...baseFailedMessage,
        message: rewardFailedNotEnoughLeftScoreMessage(currentLeftScore)
      }
    }

    const { challengePull } = pull
    if (challengePull === undefined || challengePull === null) {
      const newChallengeIssue = new ChallengePull()
      newChallengeIssue.pullId = pull.id
      newChallengeIssue.reward = rewardQuery.reward
      newChallengeIssue.challengeIssueId = challengeIssue.issueId
      await this.challengePullRepository.save(newChallengeIssue)
    } else {
      challengePull.reward = rewardQuery.reward
      await this.challengePullRepository.save(challengePull)
    }

    return {
      data: rewardQuery.reward,
      status: Status.Success,
      message: RewardMessage.RewardSuccess
    }
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

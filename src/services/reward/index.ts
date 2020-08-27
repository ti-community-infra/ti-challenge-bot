import { Service } from 'typedi'
import { InjectRepository } from 'typeorm-typedi-extensions'
// eslint-disable-next-line no-unused-vars
import { Repository } from 'typeorm/repository/Repository'
import { ChallengePull } from '../../db/entities/ChallengePull'
// eslint-disable-next-line no-unused-vars
import { Response, Status } from '../responses'
// eslint-disable-next-line no-unused-vars
import { RewardQuery } from '../../commands/queries/RewardQuery'
import { Pull } from '../../db/entities/Pull'
import { Issue } from '../../db/entities/Issue'
import { findLinkedIssueNumber } from '../utils/PullUtil'

@Service()
export default class RewardService {
  // eslint-disable-next-line no-useless-constructor
  constructor (
        @InjectRepository(Issue)
        private issueRepository: Repository<Issue>,
        @InjectRepository(ChallengePull)
        private challengePullRepository: Repository<ChallengePull>,
        @InjectRepository(Pull)
        private pullRepository: Repository<Pull>
  ) {
  }

  public async reward (rewardQuery: RewardQuery): Promise<Response<number|null>> {
    const { pull: pullQuery } = rewardQuery
    const issueNumber = findLinkedIssueNumber(pullQuery.body)
    if (issueNumber === undefined) {
      return {
        data: null,
        status: Status.Failed,
        message: 'Can not find any linked challenge issue number!'
      }
    }

    const issue = await this.issueRepository.findOne({
      relations: ['challengeIssue'],
      where: {
        issueNumber
      }
    })
    if (issue === undefined || issue.challengeIssue === undefined) {
      return {
        data: null,
        status: Status.Failed,
        message: 'Your linked issue not a challenge program issue.'
      }
    }

    const { challengeIssue } = issue
    if (!challengeIssue.hasPicked) {
      return {
        data: null,
        status: Status.Failed,
        message: 'Your linked issue not picked.'
      }
    }

    if (rewardQuery.mentor !== challengeIssue.mentor) {
      return {
        data: null,
        status: Status.Failed,
        message: 'Your not the issue mentor, so you can not reward to this pull request.'
      }
    }

    if (rewardQuery.reward > challengeIssue.score) {
      return {
        data: null,
        status: Status.Failed,
        message: 'The reward score can not more than the issue score.'
      }
    }

    let pull = await this.pullRepository.findOne({
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
      newPull.label = pullQuery.labels.map(l => {
        return l.name
      }).join(',')
      newPull.status = pullQuery.state
      newPull.updatedAt = pullQuery.updatedAt
      newPull.closedAt = pullQuery.closedAt
      pull = await this.pullRepository.save(newPull)
    }

    const newChallengeIssue = new ChallengePull()
    newChallengeIssue.pullId = pull.id
    newChallengeIssue.reward = rewardQuery.reward
    newChallengeIssue.challengeIssueId = challengeIssue.issueId
    await this.challengePullRepository.save(newChallengeIssue)

    return {
      data: rewardQuery.reward,
      status: Status.Success,
      message: 'Reward success.'
    }
  }
}

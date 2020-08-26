import { Service } from 'typedi'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { ChallengeIssues } from '../../db/entities/ChallengeIssues'
// eslint-disable-next-line no-unused-vars
import { Repository } from 'typeorm/repository/Repository'
import { Issues } from '../../db/entities/Issues'
// eslint-disable-next-line no-unused-vars
import { PickUpQuery } from '../../commands/queries/PickUpQuery'
// eslint-disable-next-line no-unused-vars
import { Response, Status } from '../response'
// eslint-disable-next-line no-unused-vars
import { LabelQuery } from '../../commands/queries/LabelQuery'

const challengeProgramLabel = 'challenge-program'

@Service()
class PickUpService {
  // eslint-disable-next-line no-useless-constructor
  constructor (
        @InjectRepository(ChallengeIssues)
        private challengeIssuesRepository: Repository<ChallengeIssues>,
        @InjectRepository(Issues)
        private issuesRepository: Repository<Issues>
  ) {
  }

  private isChallengeIssue (labels: LabelQuery[]): boolean {
    const challengeLabel = labels.filter((l: LabelQuery) => {
      return l.name === challengeProgramLabel
    })
    return challengeLabel.length > 0
  }

  public async pickUp (pickUpQuery: PickUpQuery): Promise<Response<null>> {
    const { issue: issueQuery } = pickUpQuery
    if (!this.isChallengeIssue(issueQuery.labels)) {
      return {
        data: null,
        status: Status.Failed,
        message: 'This is not a challenge program issue!'
      }
    }
    let issue = await this.issuesRepository.findOne({
      where: {
        issueNumber: issueQuery.number
      }
    })

    if (issue === undefined) {
      // No issue in database we need save this issue into database.
      const newIssue = new Issues()
      newIssue.owner = pickUpQuery.owner
      newIssue.repo = pickUpQuery.repo
      newIssue.issueNumber = issueQuery.number
      newIssue.title = issueQuery.title
      newIssue.body = issueQuery.body
      newIssue.user = issueQuery.user.login
      // FIXME: we need add association and relation.
      newIssue.label = issueQuery.labels.map(label => {
        return label.name
      }).join(',')
      newIssue.status = issueQuery.state
      newIssue.updatedAt = new Date(Date.parse(issueQuery.updatedAt))
      newIssue.closedAt = new Date(Date.parse(issueQuery.closedAt))
      issue = await this.issuesRepository.save(newIssue)
    }

    const challengeIssue = await this.challengeIssuesRepository.findOne({
      where: {
        issueId: issue.id
      }
    })

    if (challengeIssue === undefined) {
      const newChallengeIssue = new ChallengeIssues()
      newChallengeIssue.issueId = issue.id
      // FIXME: use real sig id.
      newChallengeIssue.sigId = 1003
      // FIXME: use real score.
      newChallengeIssue.score = 100
      // FIXME: use real score.
      newChallengeIssue.mentor = 'test'
      newChallengeIssue.hasPicked = true
      newChallengeIssue.currentChallengerGitHubId = pickUpQuery.challenger
      newChallengeIssue.pickedAt = new Date()
      newChallengeIssue.issue = issue
      await this.challengeIssuesRepository.save(newChallengeIssue)
      return {
        data: null,
        status: Status.Success,
        message: 'Pickup success'
      }
    } else {
      if (challengeIssue.hasPicked) {
        return {
          data: null,
          status: Status.Failed,
          message: `Pickup failed, because ${challengeIssue.currentChallengerGitHubId} already picked this issue.`
        }
      } else {
        challengeIssue.hasPicked = true
        challengeIssue.currentChallengerGitHubId = pickUpQuery.challenger
        challengeIssue.pickedAt = new Date()
        await this.challengeIssuesRepository.save(challengeIssue)
        return {
          data: null,
          status: Status.Success,
          message: 'Pickup success'
        }
      }
    }
  }
}

export default PickUpService

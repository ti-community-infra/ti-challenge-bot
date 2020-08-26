import { Service } from 'typedi'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { ChallengeIssue } from '../../db/entities/ChallengeIssue'
// eslint-disable-next-line no-unused-vars
import { Repository } from 'typeorm/repository/Repository'
import { Issue } from '../../db/entities/Issue'
// eslint-disable-next-line no-unused-vars
import { PickUpQuery } from '../../commands/queries/PickUpQuery'
// eslint-disable-next-line no-unused-vars
import { Response, Status } from '../responses'
// eslint-disable-next-line no-unused-vars
import { LabelQuery } from '../../commands/queries/LabelQuery'
import { PickUpMessage } from '../messages/PickUpMessage'

const challengeProgramLabel = 'challenge-program'

@Service()
class PickUpService {
  // eslint-disable-next-line no-useless-constructor
  constructor (
        @InjectRepository(ChallengeIssue)
        private challengeIssuesRepository: Repository<ChallengeIssue>,
        @InjectRepository(Issue)
        private issuesRepository: Repository<Issue>
  ) {
  }

  private isChallengeIssue (labels: LabelQuery[]): boolean {
    const challengeLabel = labels.filter((l: LabelQuery) => {
      return l.name === challengeProgramLabel
    })
    return challengeLabel.length > 0
  }

  private async findOrCreateIssue (pickUpQuery: PickUpQuery): Promise<Issue> {
    const { issue: issueQuery } = pickUpQuery

    let issue = await this.issuesRepository.findOne({
      where: {
        issueNumber: issueQuery.number
      }
    })

    if (issue === undefined) {
      // No issue in database we need save this issue into database.
      const newIssue = new Issue()
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

    return issue
  }

  private findSigLabel (labels: LabelQuery[]): LabelQuery | undefined {
    return labels.find((l: LabelQuery) => {
      return l.name.startsWith('sig/')
    })
  }

  public async pickUp (pickUpQuery: PickUpQuery): Promise<Response<null>> {
    const { issue: issueQuery } = pickUpQuery

    if (!this.isChallengeIssue(issueQuery.labels)) {
      return {
        data: null,
        status: Status.Failed,
        message: PickUpMessage.NotChallengeProgramIssue
      }
    }

    const sigLabel = this.findSigLabel(issueQuery.labels)
    if (sigLabel === undefined) {
      return {
        data: null,
        status: Status.Failed,
        message: PickUpMessage.NoSigInfo
      }
    }

    const issue = await this.findOrCreateIssue(pickUpQuery)

    const challengeIssue = await this.challengeIssuesRepository.findOne({
      where: {
        issueId: issue.id
      }
    })

    if (challengeIssue === undefined) {
      const newChallengeIssue = new ChallengeIssue()
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
        message: PickUpMessage.PickUpSuccess
      }
    } else {
      if (challengeIssue.hasPicked) {
        return {
          data: null,
          status: Status.Failed,
          message: PickUpMessage.failed(`${pickUpQuery.challenger} already picked this issue.`)
        }
      } else {
        challengeIssue.hasPicked = true
        challengeIssue.currentChallengerGitHubId = pickUpQuery.challenger
        challengeIssue.pickedAt = new Date()
        await this.challengeIssuesRepository.save(challengeIssue)
        return {
          data: null,
          status: Status.Success,
          message: PickUpMessage.PickUpSuccess
        }
      }
    }
  }
}

export default PickUpService

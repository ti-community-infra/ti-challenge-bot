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
import { pickUpFailedMessage, PickUpMessage } from '../messages/PickUpMessage'
import { ProjectSig } from '../../db/entities/ProjectSig'
import { GithubLabelSig } from '../../db/entities/GithubLabelSig'
import { findSigLabel, isChallengeIssue, issueUtil } from '../utils/IssueUtil'

@Service()
class PickUpService {
  // eslint-disable-next-line no-useless-constructor
  constructor (
        @InjectRepository(ChallengeIssue)
        private challengeIssuesRepository: Repository<ChallengeIssue>,
        @InjectRepository(Issue)
        private issuesRepository: Repository<Issue>,
        @InjectRepository(ProjectSig)
        private projectSigRepository: Repository<ProjectSig>
  ) {
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
      newIssue.updatedAt = issueQuery.updatedAt
      newIssue.closedAt = issueQuery.closedAt
      issue = await this.issuesRepository.save(newIssue)
    }

    return issue
  }

  private async findSigIdByLabel (labelQuery: LabelQuery): Promise<number | undefined> {
    const projectSig = await this.projectSigRepository.createQueryBuilder('ps')
      .leftJoinAndSelect(GithubLabelSig, 'gls', 'ps.project_sig_id = gls.project_sig_id')
      .where(`gls.label = '${labelQuery.name}'`).getOne()

    return projectSig?.sigId
  }

  public async pickUp (pickUpQuery: PickUpQuery): Promise<Response<null>> {
    const baseFailedMessage = {
      data: null,
      status: Status.Failed
    }

    // Check is a challenge program issue.
    const { issue: issueQuery } = pickUpQuery
    if (!isChallengeIssue(issueQuery.labels)) {
      return {
        ...baseFailedMessage,
        message: PickUpMessage.NotChallengeProgramIssue
      }
    }

    // Check the sig info.
    const sigLabel = findSigLabel(issueQuery.labels)
    if (sigLabel === undefined) {
      return {
        ...baseFailedMessage,
        message: PickUpMessage.NoSigInfo
      }
    }
    const sigId = await this.findSigIdByLabel(sigLabel)
    if (sigId === undefined) {
      return {
        ...baseFailedMessage,
        message: PickUpMessage.IllegalSigInfo
      }
    }

    // Check the mentor and score info.
    const mentorAndScore = issueUtil(issueQuery.body)
    if (mentorAndScore === undefined) {
      return {
        ...baseFailedMessage,
        message: PickUpMessage.IllegalIssueFormat
      }
    }

    // Check the issue if exist in database.
    const issue = await this.findOrCreateIssue(pickUpQuery)

    // Pick up.
    const challengeIssue = await this.challengeIssuesRepository.findOne({
      where: {
        issueId: issue.id
      }
    })

    if (challengeIssue === undefined) {
      const newChallengeIssue = new ChallengeIssue()
      newChallengeIssue.issueId = issue.id
      newChallengeIssue.sigId = sigId
      newChallengeIssue.score = mentorAndScore.score
      newChallengeIssue.mentor = mentorAndScore.mentor
      newChallengeIssue.hasPicked = true
      newChallengeIssue.currentChallengerGitHubId = pickUpQuery.challenger
      newChallengeIssue.pickedAt = new Date().toLocaleString()
      newChallengeIssue.issue = issue
      await this.challengeIssuesRepository.save(newChallengeIssue)
      return {
        data: null,
        status: Status.Success,
        message: PickUpMessage.PickUpSuccess
      }
    }

    if (challengeIssue.hasPicked) {
      return {
        ...baseFailedMessage,
        message: pickUpFailedMessage(`${pickUpQuery.challenger} already picked this issue.`)
      }
    } else {
      challengeIssue.hasPicked = true
      challengeIssue.currentChallengerGitHubId = pickUpQuery.challenger
      challengeIssue.pickedAt = new Date().toLocaleString()
      await this.challengeIssuesRepository.save(challengeIssue)
      return {
        data: null,
        status: Status.Success,
        message: PickUpMessage.PickUpSuccess
      }
    }
  }
}

export default PickUpService

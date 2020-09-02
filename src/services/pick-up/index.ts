import { Service } from 'typedi'
import { InjectRepository } from 'typeorm-typedi-extensions'
// eslint-disable-next-line no-unused-vars
import { Repository } from 'typeorm/repository/Repository'

import { ChallengeIssue } from '../../db/entities/ChallengeIssue'
// eslint-disable-next-line no-unused-vars
import { Issue } from '../../db/entities/Issue'
// eslint-disable-next-line no-unused-vars
import { PickUpQuery } from '../../commands/queries/PickUpQuery'
// eslint-disable-next-line no-unused-vars
import { Response, Status } from '../responses'
// eslint-disable-next-line no-unused-vars
import { LabelQuery } from '../../commands/queries/LabelQuery'
import { alreadyPickedMessage, PickUpMessage } from '../messages/PickUpMessage'
import { ProjectSig } from '../../db/entities/ProjectSig'
import { GithubLabelSig } from '../../db/entities/GithubLabelSig'
import { findSigLabel, isChallengeIssue, findMentorAndScore } from '../utils/IssueUtil'
import { ChallengeProgram } from '../../db/entities/ChallengeProgram'
import {IssueOrPullStatus} from "../../repositoies/score";

@Service()
class PickUpService {
  // eslint-disable-next-line no-useless-constructor
  constructor (
        @InjectRepository(ChallengeIssue)
        private challengeIssueRepository: Repository<ChallengeIssue>,
        @InjectRepository(Issue)
        private issueRepository: Repository<Issue>,
        @InjectRepository(ProjectSig)
        private projectSigRepository: Repository<ProjectSig>,
        @InjectRepository(ChallengeProgram)
        private challengeProgramRepository: Repository<ChallengeProgram>
  ) {
  }

  private async findOrCreateIssue (pickUpQuery: PickUpQuery): Promise<Issue> {
    const { issue: issueQuery } = pickUpQuery

    let issue = await this.issueRepository.findOne({
      relations: ['challengeIssue'],
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
      issue = await this.issueRepository.save(newIssue)
    }

    return issue
  }

  private async findSigIdByLabelName (labelQueryName: string): Promise<number | undefined> {
    const projectSig = await this.projectSigRepository.createQueryBuilder('ps')
      .leftJoinAndSelect(GithubLabelSig, 'gls', 'ps.project_sig_id = gls.project_sig_id')
      .where(`gls.label = '${labelQueryName}'`).getOne()

    return projectSig?.sigId
  }

  private async findChallengeProgram (labels: LabelQuery[]): Promise<ChallengeProgram|undefined> {
    const programs = await this.challengeProgramRepository.createQueryBuilder().getMany()
    let program
    programs.forEach(p => {
      labels.forEach(l => {
        if (p.programTheme === l.name) {
          program = p
        }
      })
    })

    return program
  }

  public async pickUp (pickUpQuery: PickUpQuery): Promise<Response<null>> {
    const baseFailedMessage = {
      data: null,
      status: Status.Failed
    }

    // Check if issue closed.
    const { issue: issueQuery } = pickUpQuery
    if(issueQuery.state === IssueOrPullStatus.Closed){
      return {
        ...baseFailedMessage,
        message: PickUpMessage.IssueAlreadyClosed
      }
    }

    // Check is a challenge program issue.
    if (!isChallengeIssue(issueQuery.labels)) {
      return {
        ...baseFailedMessage,
        message: PickUpMessage.NotChallengeProgramIssue
      }
    }

    // Check the sig info.
    const sigLabelName = pickUpQuery.defaultSigLabel || findSigLabel(issueQuery.labels)?.name
    if (sigLabelName === undefined) {
      return {
        ...baseFailedMessage,
        message: PickUpMessage.NoSigInfo
      }
    }
    const sigId = await this.findSigIdByLabelName(sigLabelName.toLowerCase())
    if (sigId === undefined) {
      return {
        ...baseFailedMessage,
        message: PickUpMessage.IllegalSigInfo
      }
    }

    // Check the mentor and score info.
    const mentorAndScore = findMentorAndScore(issueQuery.body)

    const program = await this.findChallengeProgram(issueQuery.labels)

    // Check the issue if exist in database.
    const issue = await this.findOrCreateIssue(pickUpQuery)

    // Pick up.
    const { challengeIssue } = issue

    if (challengeIssue === undefined) {
      const newChallengeIssue = new ChallengeIssue()
      newChallengeIssue.issueId = issue.id
      newChallengeIssue.sigId = sigId
      newChallengeIssue.score = mentorAndScore?.score || 0
      newChallengeIssue.mentor = mentorAndScore?.mentor || pickUpQuery.issue.user.login
      newChallengeIssue.hasPicked = true
      newChallengeIssue.currentChallengerGitHubId = pickUpQuery.challenger
      newChallengeIssue.pickedAt = new Date().toLocaleString()
      newChallengeIssue.issue = issue
      newChallengeIssue.challengeProgramId = program?.id
      await this.challengeIssueRepository.save(newChallengeIssue)
      return {
        data: null,
        status: Status.Success,
        message: PickUpMessage.PickUpSuccess
      }
    }

    if (challengeIssue.hasPicked && challengeIssue.currentChallengerGitHubId) {
      return {
        ...baseFailedMessage,
        message: alreadyPickedMessage(challengeIssue.currentChallengerGitHubId)
      }
    } else {
      challengeIssue.hasPicked = true
      challengeIssue.currentChallengerGitHubId = pickUpQuery.challenger
      challengeIssue.pickedAt = new Date().toLocaleString()
      challengeIssue.challengeProgramId = program?.id
      await this.challengeIssueRepository.save(challengeIssue)
      return {
        data: null,
        status: Status.Success,
        message: PickUpMessage.PickUpSuccess
      }
    }
  }
}

export default PickUpService

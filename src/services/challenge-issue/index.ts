import { Service } from 'typedi'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { ChallengeIssue } from '../../db/entities/ChallengeIssue'
// eslint-disable-next-line no-unused-vars
import { Repository } from 'typeorm/repository/Repository'
import { Issue } from '../../db/entities/Issue'
// eslint-disable-next-line no-unused-vars
import { ChallengeIssueQuery } from '../../commands/queries/ChallengeIssueQuery'
// eslint-disable-next-line no-unused-vars
import { Reply, Status } from '../reply'
// eslint-disable-next-line no-unused-vars
import { PickUpQuery } from '../../commands/queries/PickUpQuery'
import { ProjectSig } from '../../db/entities/ProjectSig'
// eslint-disable-next-line no-unused-vars
import { LabelQuery } from '../../commands/queries/LabelQuery'
import { ChallengeProgram } from '../../db/entities/ChallengeProgram'
import {
  alreadyPickedMessage,
  ChallengeIssueMessage,
  ChallengeIssueTip,
  ChallengeIssueWarning
} from '../messages/ChallengeIssueMessage'
import { findMentorAndScore, findSigLabel, isChallengeIssue, isClosed } from '../utils/IssueUtil'
import { GithubLabelSig } from '../../db/entities/GithubLabelSig'
// eslint-disable-next-line no-unused-vars
import { GiveUpQuery } from '../../commands/queries/GiveUpQuery'
import { GiveUpMessage } from '../messages/GiveUpMessage'

@Service()
export default class ChallengeIssueService {
  // eslint-disable-next-line no-useless-constructor
  constructor (
        @InjectRepository(ChallengeIssue)
        private challengeIssueRepository: Repository<ChallengeIssue>,
        @InjectRepository(Issue)
        private issueRepository: Repository<Issue>,
        @InjectRepository(GithubLabelSig)
        private githubLabelSigRepository: Repository<GithubLabelSig>,
        @InjectRepository(ChallengeProgram)
        private challengeProgramRepository: Repository<ChallengeProgram>
  ) {
  }

  private async findOrAddIssue (query: PickUpQuery | ChallengeIssueQuery): Promise<Issue> {
    const { issue: issueQuery } = query

    let issue = await this.issueRepository.findOne({
      relations: ['challengeIssue'],
      where: {
        issueNumber: issueQuery.number
      }
    })

    if (issue === undefined) {
      // No issue in database we need save this issue into database.
      const newIssue = new Issue()
      newIssue.owner = query.owner
      newIssue.repo = query.repo
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

  private async findSigId (labels: LabelQuery[], defaultSigLabel?: string): Promise<number|undefined > {
    // Notice: label priority.
    const sigLabelName = defaultSigLabel || findSigLabel(labels)?.name
    if (sigLabelName === undefined) {
      return
    }

    // FIXME: now we use lower case sig label name, maybe we should fix it on github.
    const { sigId } = await this.githubLabelSigRepository.createQueryBuilder('gls')
      .leftJoinAndSelect(ProjectSig, 'ps', 'ps.project_sig_id = gls.project_sig_id')
      .where(`gls.label = '${sigLabelName}'`)
      .select('ps.sig_id', 'sigId')
      .getRawOne()
    if (sigId === undefined) {
      return
    }
    return sigId
  }

  public async pickUp (pickUpQuery: PickUpQuery): Promise<Reply<null>> {
    const baseFailedMessage = {
      data: null,
      status: Status.Failed
    }

    // Check if issue closed.
    const { issue: issueQuery } = pickUpQuery
    if (isClosed(issueQuery)) {
      return {
        ...baseFailedMessage,
        message: ChallengeIssueMessage.IssueAlreadyClosed
      }
    }

    // Check is a challenge program issue.
    if (!isChallengeIssue(issueQuery.labels)) {
      return {
        ...baseFailedMessage,
        message: ChallengeIssueMessage.NotChallengeProgramIssue
      }
    }

    // Check the sig info.
    const sigId = await this.findSigId(issueQuery.labels, pickUpQuery.defaultSigLabel)
    if (sigId === undefined) {
      return {
        ...baseFailedMessage,
        message: ChallengeIssueMessage.NoSigInfo
      }
    }

    // Check the mentor and score info.
    const mentorAndScore = findMentorAndScore(issueQuery.body)

    const program = await this.findChallengeProgram(issueQuery.labels)

    // Check the issue if exist in database.
    const issue = await this.findOrAddIssue(pickUpQuery)

    // Pick up.
    const { challengeIssue } = issue

    if (challengeIssue === undefined || challengeIssue === null) {
      const newChallengeIssue = new ChallengeIssue()
      newChallengeIssue.issueId = issue.id
      newChallengeIssue.sigId = sigId
      newChallengeIssue.score = mentorAndScore?.score || null
      newChallengeIssue.mentor = mentorAndScore?.mentor || null
      newChallengeIssue.hasPicked = true
      newChallengeIssue.currentChallengerGitHubId = pickUpQuery.challenger
      newChallengeIssue.pickedAt = new Date().toLocaleString()
      newChallengeIssue.issue = issue
      newChallengeIssue.challengeProgramId = program?.id
      await this.challengeIssueRepository.save(newChallengeIssue)
      return {
        data: null,
        status: Status.Success,
        message: ChallengeIssueMessage.PickUpSuccess
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
        message: ChallengeIssueMessage.PickUpSuccess
      }
    }
  }

  public async giveUp (giveUpQuery: GiveUpQuery):Promise<Reply<null>> {
    const baseFailedMessage = {
      data: null,
      status: Status.Failed
    }

    if (!isChallengeIssue(giveUpQuery.labels)) {
      return {
        ...baseFailedMessage,
        message: GiveUpMessage.NotChallengeProgramIssue
      }
    }

    const issue = await this.issueRepository.findOne({
      relations: ['challengeIssue'],
      where: {
        issueNumber: giveUpQuery.issueId
      }
    })

    if (issue === undefined || issue.challengeIssue === undefined || issue.challengeIssue === null) {
      return {
        ...baseFailedMessage,
        message: GiveUpMessage.NotChallengeProgramIssue
      }
    }

    const { challengeIssue } = issue
    if (!challengeIssue.hasPicked || challengeIssue.currentChallengerGitHubId !== giveUpQuery.challenger) {
      return {
        ...baseFailedMessage,
        message: GiveUpMessage.NotChallenger
      }
    }

    challengeIssue.hasPicked = false
    challengeIssue.pickedAt = null
    challengeIssue.currentChallengerGitHubId = null

    await this.challengeIssueRepository.save(challengeIssue)
    return {
      data: null,
      status: Status.Success,
      message: GiveUpMessage.GiveUpSuccess
    }
  }

  /**
   * Create challenge issue when the issue opened.
   * @param issueId the issue database id.
   * @param challengeIssueQuery challenge issue query.
   */
  public async createWhenIssueOpened (issueId: number, challengeIssueQuery: ChallengeIssueQuery):Promise<Reply<ChallengeIssue|undefined>> {
    const { issue: issueQuery } = challengeIssueQuery
    const baseFailedMessage = {
      data: undefined,
      status: Status.Failed
    }

    // Check the sig info.
    const sigId = await this.findSigId(issueQuery.labels, challengeIssueQuery.defaultSigLabel)
    if (sigId === undefined) {
      return {
        ...baseFailedMessage,
        message: ChallengeIssueMessage.NoSigInfo
      }
    }

    // Try to find mentor and score.
    let warning, tip
    const mentorAndScore = findMentorAndScore(issueQuery.body)
    if (mentorAndScore === undefined) {
      warning = ChallengeIssueWarning.IllegalIssueFormat
      tip = ChallengeIssueTip.RefineIssueFormat
    }

    const program = await this.findChallengeProgram(issueQuery.labels)

    const newChallengeIssue = new ChallengeIssue()
    newChallengeIssue.issueId = issueId
    newChallengeIssue.sigId = sigId
    newChallengeIssue.score = mentorAndScore?.score
    newChallengeIssue.mentor = mentorAndScore?.mentor
    newChallengeIssue.challengeProgramId = program?.id
    const data = await this.challengeIssueRepository.save(newChallengeIssue)

    if (warning !== undefined) {
      return {
        data,
        status: Status.Problematic,
        message: ChallengeIssueMessage.AddedButMissInfo,
        warning,
        tip
      }
    }

    return {
      data,
      status: Status.Success,
      message: ChallengeIssueMessage.Created
    }
  }

  public async updateWhenIssueEdited (issueId:number, challengeIssueQuery: ChallengeIssueQuery): Promise<Reply<ChallengeIssue|undefined>|undefined> {
    const { issue: issueQuery } = challengeIssueQuery
    const baseFailedMessage = {
      data: undefined,
      status: Status.Failed
    }

    // Check the sig info.
    const sigId = await this.findSigId(issueQuery.labels, challengeIssueQuery.defaultSigLabel)
    if (sigId === undefined) {
      return {
        ...baseFailedMessage,
        message: ChallengeIssueMessage.NoSigInfo
      }
    }

    // Try to find challenge issue.
    const challengeIssue = await this.challengeIssueRepository.findOne({
      where: {
        issueId
      }
    })
    if (challengeIssue === undefined) {
      return
    }

    // Try to find the mentor and score.
    let warning, tip
    const mentorAndScore = findMentorAndScore(issueQuery.body)
    if (mentorAndScore === undefined) {
      tip = ChallengeIssueTip.RefineIssueFormat
      warning = ChallengeIssueWarning.IllegalIssueFormat
    }

    const program = await this.findChallengeProgram(issueQuery.labels)

    challengeIssue.sigId = sigId
    // FIXME: if the issue remove the mentor and score, we should update it.
    challengeIssue.score = mentorAndScore?.score
    challengeIssue.mentor = mentorAndScore?.mentor
    // Notice: here will challenge program id.
    challengeIssue.challengeProgramId = program?.id
    await this.challengeIssueRepository.save(challengeIssue)

    if (warning !== undefined) {
      return {
        data: challengeIssue,
        status: Status.Problematic,
        message: ChallengeIssueMessage.UpdatedButStillMissInfo,
        warning,
        tip
      }
    }

    return {
      data: challengeIssue,
      status: Status.Success,
      message: ChallengeIssueMessage.Updated
    }
  }

  /**
   * Remove challenge issue when issue unlabeled.
   * @param issueId
   */
  public async removeWhenIssueUnlabeled (issueId: number): Promise<Reply<null>|undefined> {
    // Try to find challenge issue.
    // If we cannot find it, then we do not need remove it.
    const challengeIssue = await this.challengeIssueRepository.findOne({
      relations: ['challengePulls'],
      where: {
        issueId
      }
    })
    if (challengeIssue === undefined) {
      return
    }

    // If the challenge issue already picked by some one, we can not remove it.
    if (challengeIssue.hasPicked) {
      return {
        data: null,
        status: Status.Failed,
        message: ChallengeIssueMessage.CannotRemoveBecausePicked
      }
    }
    const { challengePulls } = challengeIssue

    // If the challenge issue already have some pulls, we can not remove it.
    if (challengePulls !== undefined && challengePulls !== null && challengePulls.length > 0) {
      return {
        data: null,
        status: Status.Failed,
        message: ChallengeIssueMessage.CannotRemoveBecauseHasPulls
      }
    }

    // Remove it.
    await this.challengeIssueRepository.remove(challengeIssue)
    return {
      data: null,
      status: Status.Success,
      message: ChallengeIssueMessage.Removed
    }
  }
}

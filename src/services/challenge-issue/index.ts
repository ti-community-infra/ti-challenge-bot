import { Service } from 'typedi'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { ChallengeIssue } from '../../db/entities/ChallengeIssue'
// eslint-disable-next-line no-unused-vars
import { Repository } from 'typeorm/repository/Repository'
import { Issue } from '../../db/entities/Issue'
// eslint-disable-next-line no-unused-vars
import { ChallengeIssueQuery } from '../../queries/ChallengeIssueQuery'
// eslint-disable-next-line no-unused-vars
import { Reply, Status } from '../reply'
// eslint-disable-next-line no-unused-vars
import { PickUpQuery } from '../../queries/PickUpQuery'
import { ProjectSig } from '../../db/entities/ProjectSig'
// eslint-disable-next-line no-unused-vars
import { LabelQuery } from '../../queries/LabelQuery'
import { ChallengeProgram, ChallengeProgramType } from '../../db/entities/ChallengeProgram'
import {
  alreadyPickedMessage, assignFlowNeedHelpMessage,
  ChallengeIssueMessage,
  ChallengeIssueTip,
  ChallengeIssueWarning,
  pickUpSuccessMissInfoWarning
} from '../messages/ChallengeIssueMessage'
import {
  checkIsInAssignFlow,
  findMentorAndScore,
  findSigLabel,
  isChallengeIssue,
  isClosed,
  needHelp
} from '../utils/IssueUtil'
import { GithubLabelSig } from '../../db/entities/GithubLabelSig'
// eslint-disable-next-line no-unused-vars
import { GiveUpQuery } from '../../queries/GiveUpQuery'
import { ChallengeTeam } from '../../db/entities/ChallengeTeam'
import { ChallengersChallengeTeams } from '../../db/entities/ChallengersChallengeTeams'
import { DEFAULT_CHALLENGE_PROGRAM_THEME } from '../../config/Config'

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

  private async findChallengeProgramOrDefaultProgram (labels: LabelQuery[]): Promise<ChallengeProgram|undefined> {
    const programs = await this.challengeProgramRepository.createQueryBuilder().getMany()
    let program, defaultProgram
    programs.forEach(p => {
      labels.forEach(l => {
        if (p.programTheme === l.name) {
          program = p
        }
        if (p.programTheme === DEFAULT_CHALLENGE_PROGRAM_THEME) {
          defaultProgram = p
        }
      })
    })

    return program || defaultProgram
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

  private async findTeam (githubId: string, challengeProgramTheme: string): Promise<ChallengeTeam|undefined> {
    return await this.challengeProgramRepository.createQueryBuilder('cpg')
      .where(`cpg.program_theme = '${challengeProgramTheme}'`)
      .leftJoinAndSelect(ChallengeTeam, 'ct', 'cpg.id = ct.challenge_program_id')
      .leftJoinAndSelect(ChallengersChallengeTeams, 'cct', 'ct.id = cct.challenge_team_id')
      .where(`cct.challenger_github_id = '${githubId}'`)
      .getRawOne<ChallengeTeam>()
  }

  /**
   * Pick up challenge issue.
   * @param pickUpQuery
   */
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
        data: null,
        status: Status.Problematic,
        message: ChallengeIssueMessage.NotChallengeProgramIssue,
        tip: ChallengeIssueTip.AddChallengeProgramLabel
      }
    }

    // Check the sig info.
    const sigId = await this.findSigId(issueQuery.labels, pickUpQuery.defaultSigLabel)
    if (sigId === undefined) {
      return {
        data: null,
        status: Status.Problematic,
        message: ChallengeIssueMessage.NoSigInfo,
        tip: ChallengeIssueTip.RefineSigFormat
      }
    }

    // NOTICE: check the mentor and score info and assign flow.
    const mentorAndScore = findMentorAndScore(issueQuery.body)

    let inAssignFlow = false
    let warning, tip
    if (mentorAndScore === undefined) {
      warning = pickUpSuccessMissInfoWarning(issueQuery.user.login)
      tip = ChallengeIssueTip.RefineIssueFormat
    } else {
      inAssignFlow = checkIsInAssignFlow(issueQuery.assignees, mentorAndScore.mentor)
    }

    const program = await this.findChallengeProgramOrDefaultProgram(issueQuery.labels)

    // TODO: maybe we should check the ONLY_INDIVIDUAL case.
    if (program?.type === ChallengeProgramType.ONLY_TEAM) {
      const team = await this.findTeam(pickUpQuery.challenger, program.programTheme)
      // TODO: we need add more info about join a team.
      if (team === undefined) {
        return {
          ...baseFailedMessage,
          message: ChallengeIssueMessage.NoTeam
        }
      }
    }

    // Check the issue if exist in database.
    const issue = await this.findOrAddIssue(pickUpQuery)

    // Pick up.
    let { challengeIssue } = issue

    // NOTICE: if this challenge not exist we need to add it.
    if ((challengeIssue === undefined || challengeIssue === null)) {
      challengeIssue = new ChallengeIssue()
      challengeIssue.issueId = issue.id
      challengeIssue.sigId = sigId
      challengeIssue.score = mentorAndScore?.score || null
      challengeIssue.mentor = mentorAndScore?.mentor || null
      challengeIssue.issue = issue
      challengeIssue.challengeProgramId = program?.id
      await this.challengeIssueRepository.save(challengeIssue)
    }

    // NOTICE: check in assign flow.
    if (!inAssignFlow) {
      if (challengeIssue.hasPicked && challengeIssue.currentChallengerGitHubId) {
        return {
          ...baseFailedMessage,
          message: alreadyPickedMessage(challengeIssue.currentChallengerGitHubId)
        }
      } else {
        challengeIssue.hasPicked = true
        challengeIssue.currentChallengerGitHubId = pickUpQuery.challenger
        challengeIssue.pickedAt = new Date().toLocaleString()
        await this.challengeIssueRepository.save(challengeIssue)
        return {
          data: null,
          status: Status.Success,
          message: ChallengeIssueMessage.PickUpSuccess,
          warning,
          tip
        }
      }
    } else {
      if (needHelp(issueQuery.labels)) {
        return {
          data: null,
          status: Status.Failed,
          message: assignFlowNeedHelpMessage(mentorAndScore!.mentor)
        }
      } else {
        return {
          data: null,
          status: Status.Failed,
          message: ChallengeIssueMessage.AssignFlowInProcess
        }
      }
    }
  }

  /**
   * Give up challenge.
   * @param giveUpQuery
   */
  public async giveUp (giveUpQuery: GiveUpQuery):Promise<Reply<null>| undefined> {
    const baseFailedMessage = {
      data: null,
      status: Status.Failed
    }

    // If not a challenge issue.
    if (!isChallengeIssue(giveUpQuery.labels)) {
      return
    }

    const issue = await this.issueRepository.findOne({
      relations: ['challengeIssue'],
      where: {
        issueNumber: giveUpQuery.issueId
      }
    })
    // Also not a challenge issue.
    if (issue === undefined || issue.challengeIssue === undefined || issue.challengeIssue === null) {
      return
    }

    const { challengeIssue } = issue
    // Not challenger or the issue not picked.
    if (!challengeIssue.hasPicked || challengeIssue.currentChallengerGitHubId !== giveUpQuery.challenger) {
      return {
        ...baseFailedMessage,
        message: ChallengeIssueMessage.NotChallenger
      }
    }

    challengeIssue.hasPicked = false
    challengeIssue.pickedAt = null
    challengeIssue.currentChallengerGitHubId = null

    await this.challengeIssueRepository.save(challengeIssue)
    return {
      data: null,
      status: Status.Success,
      message: ChallengeIssueMessage.GiveUpSuccess
    }
  }

  /**
   * Create challenge issue when the issue opened.
   * @param issueId the issue database id.
   * @param challengeIssueQuery challenge issue query.
   */
  public async createWhenIssueOpened (issueId: number, challengeIssueQuery: ChallengeIssueQuery):Promise<Reply<ChallengeIssue|undefined>> {
    const { issue: issueQuery } = challengeIssueQuery

    // Check the sig info.
    const sigId = await this.findSigId(issueQuery.labels, challengeIssueQuery.defaultSigLabel)
    if (sigId === undefined) {
      return {
        data: undefined,
        status: Status.Problematic,
        message: ChallengeIssueMessage.NoSigInfo,
        tip: ChallengeIssueTip.RefineSigFormat
      }
    }

    // Try to find mentor and score.
    let warning, tip
    const mentorAndScore = findMentorAndScore(issueQuery.body)
    if (mentorAndScore === undefined) {
      warning = ChallengeIssueWarning.IllegalIssueFormat
      tip = ChallengeIssueTip.RefineIssueFormat
    }

    const program = await this.findChallengeProgramOrDefaultProgram(issueQuery.labels)

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

    // Check the sig info.
    const sigId = await this.findSigId(issueQuery.labels, challengeIssueQuery.defaultSigLabel)
    if (sigId === undefined) {
      return {
        data: undefined,
        status: Status.Problematic,
        message: ChallengeIssueMessage.NoSigInfo,
        tip: ChallengeIssueTip.RefineSigFormat
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

    const program = await this.findChallengeProgramOrDefaultProgram(issueQuery.labels)

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

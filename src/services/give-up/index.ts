import { Service } from 'typedi'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { ChallengeIssue } from '../../db/entities/ChallengeIssue'
// eslint-disable-next-line no-unused-vars
import { Repository } from 'typeorm/repository/Repository'
// eslint-disable-next-line no-unused-vars
import { GiveUpQuery } from '../../commands/queries/GiveUpQuery'
// eslint-disable-next-line no-unused-vars
import { Response, Status } from '../responses'
import { Issue } from '../../db/entities/Issue'
import { GiveUpMessage } from '../messages/GiveUpMessage'
import { isChallengeIssue } from '../utils/IssueUtil'

@Service()
export default class GiveUpService {
  // eslint-disable-next-line no-useless-constructor
  constructor (
        @InjectRepository(ChallengeIssue)
        private challengeIssuesRepository: Repository<ChallengeIssue>,
        @InjectRepository(Issue)
        private issueRepository: Repository<Issue>
  ) {
  }

  public async giveUp (giveUpQuery: GiveUpQuery):Promise<Response<null>> {
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

    if (issue === undefined) {
      return {
        ...baseFailedMessage,
        message: GiveUpMessage.NotChallenger
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

    await this.challengeIssuesRepository.save(challengeIssue)
    return {
      data: null,
      status: Status.Success,
      message: GiveUpMessage.GiveUpSuccess
    }
  }
}

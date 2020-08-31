// eslint-disable-next-line no-unused-vars
import { EntityRepository } from 'typeorm'
import { Service } from 'typedi'
import { ChallengeIssue } from '../../db/entities/ChallengeIssue'
import { ChallengeProgram } from '../../db/entities/ChallengeProgram'
import { ChallengePull } from '../../db/entities/ChallengePull'
import { Pull } from '../../db/entities/Pull'
// eslint-disable-next-line no-unused-vars
import { Repository } from 'typeorm/repository/Repository'

export enum IssueOrPullStatus {
    // eslint-disable-next-line no-unused-vars
    Open = 'open',
    // eslint-disable-next-line no-unused-vars
    Closed = 'closed',
    // eslint-disable-next-line no-unused-vars
    Merged = 'merged'
}

@Service()
@EntityRepository(ChallengeIssue)
export default class ScoreRepository extends Repository<ChallengeIssue> {
  public async getCurrentScoreInProgram (theme: string, username: string) : Promise<number> {
    const { score } = await this.createQueryBuilder('ci')
      .leftJoinAndSelect(ChallengeProgram, 'cpg', 'ci.challenge_program_id = cpg.id')
      .leftJoinAndSelect(ChallengePull, 'cp', ' ci.issue_id = cp.challenge_issue_id')
      .leftJoinAndSelect(Pull, 'p', 'cp.pull_id = p.id')
      .where(`cpg.program_theme = '${theme}' and ci.current_challenger_github_id = '${username}' and p.status = '${IssueOrPullStatus.Merged}'`)
      .select('sum(cp.reward)', 'score')
      .getRawOne()

    return score
  }

  public async getCurrentScoreInLongTermProgram (username: string) : Promise<number> {
    const { score } = await this.createQueryBuilder('ci')
      .leftJoinAndSelect(ChallengePull, 'cp', ' ci.issue_id = cp.challenge_issue_id')
      .leftJoinAndSelect(Pull, 'p', 'cp.pull_id = p.id')
      .where(`ci.challenge_program_id is null and ci.current_challenger_github_id = '${username}' and p.status = '${IssueOrPullStatus.Merged}'`)
      .select('sum(cp.reward)', 'score')
      .getRawOne()

    return score
  }

  public async getCurrentLeftScore (issueId: number, pullId: number) : Promise<number|undefined> {
    const challengeIssue = await this.findOne({
      relations: ['challengePulls'],
      where: {
        issueId
      }
    })
    if (challengeIssue === undefined) {
      return
    }

    const { challengePulls } = challengeIssue

    if (challengePulls === undefined) {
      return challengeIssue.score
    } else {
      return challengeIssue.score - challengePulls.filter(c => {
        return c.pullId !== pullId
      }).map(c => {
        return c.reward
      }).reduce((total, currentNum) => {
        return total + currentNum
      })
    }
  }
}

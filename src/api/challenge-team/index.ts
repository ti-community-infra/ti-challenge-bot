// eslint-disable-next-line no-unused-vars
import ChallengeTeamService from '../../services/challenge-team'
// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express'
// eslint-disable-next-line no-unused-vars
import { ChallengeTeamQuery } from '../../commands/queries/ChallengeTeamQuery'
const createTeam = async (req:Request, res:Response, challengeTeamService: ChallengeTeamService) => {
  const challengeTeamQuery = <ChallengeTeamQuery>req.body

  const response = await challengeTeamService.create(challengeTeamQuery)

  res.status(response.status)
  res.json(response)
}
export default createTeam

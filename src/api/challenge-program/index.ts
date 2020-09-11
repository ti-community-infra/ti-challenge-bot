// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express'
// eslint-disable-next-line no-unused-vars
import ChallengeProgramService from '../../services/challenge-program'

const findAllChallengePrograms = async (_req: Request, res: Response, challengeProgramService: ChallengeProgramService) => {
  const response = await challengeProgramService.findAll()

  res.status(response.status)
  res.json(response)
}

export default findAllChallengePrograms

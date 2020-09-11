import { Service } from 'typedi'
import { InjectRepository } from 'typeorm-typedi-extensions'
// eslint-disable-next-line no-unused-vars
import { Repository } from 'typeorm'
import { ChallengeProgram } from '../../db/entities/ChallengeProgram'
// eslint-disable-next-line no-unused-vars
import { Response } from '../response'
import { StatusCodes } from 'http-status-codes'

@Service()
export default class ChallengeProgramService {
  // eslint-disable-next-line no-useless-constructor
  constructor (
        @InjectRepository(ChallengeProgram)
        private challengeProgramRepository: Repository<ChallengeProgram>
  ) {
  }

  public async findAll ():Promise<Response<ChallengeProgram[]>> {
    const programs = await this.challengeProgramRepository.find()

    return {
      data: programs,
      status: StatusCodes.OK,
      message: 'Get all program success.'
    }
  }
}

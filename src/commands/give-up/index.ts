// eslint-disable-next-line no-unused-vars
import { Context } from 'probot'

// eslint-disable-next-line no-unused-vars
import { GiveUpQuery } from '../queries/GiveUpQuery'
// eslint-disable-next-line no-unused-vars
import GiveUpService from '../../services/give-up'
// eslint-disable-next-line no-unused-vars
import { LabelQuery } from '../queries/LabelQuery'
import { Status } from '../../services/responses'
import { PICKED_LABEL } from '../labels'

const giveUp = async (context: Context, giveUpService: GiveUpService) => {
  const issueResponse = await context.github.issues.get(context.issue())
  const { data } = issueResponse
  const { sender } = context.payload
  const labels: LabelQuery[] = data.labels.map(label => {
    return {
      ...label
    }
  })
  const giveUpQuery: GiveUpQuery = {
    challenger: sender.login,
    issueId: data.number,
    labels
  }

  const result = await giveUpService.giveUp(giveUpQuery)

  switch (result.status) {
    case Status.Failed: {
      context.log.error(`Give up ${giveUpQuery} failed because ${result.message}.`)
      break
    }
    case Status.Success: {
      await context.github.issues.removeLabel(context.issue({
        name: PICKED_LABEL
      }))
      context.log.info(`Give up ${giveUpQuery} success.`)
      break
    }
  }

  await context.github.issues.createComment(context.issue({ body: result.message }))
}

export default giveUp

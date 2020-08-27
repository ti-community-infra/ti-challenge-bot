// eslint-disable-next-line no-unused-vars
import { Context } from 'probot'
// eslint-disable-next-line no-unused-vars
import { GiveUpQuery } from '../queries/GiveUpQuery'
// eslint-disable-next-line no-unused-vars
import GiveUpService from '../../services/give-up'
// eslint-disable-next-line no-unused-vars
import { LabelQuery } from '../queries/LabelQuery'

const giveUp = async (context: Context, giveUpService: GiveUpService) => {
  const issueResponse = await context.github.issues.get(context.issue())
  const { data } = issueResponse
  const { sender } = context.payload
  const labels: LabelQuery[] = data.labels.map(label => {
    return {
      id: label.id,
      name: label.name,
      description: label.description,
      default: label.default
    }
  })
  const giveUpQuery: GiveUpQuery = {
    challenger: sender.login,
    issueId: data.number,
    labels
  }

  const result = await giveUpService.giveUp(giveUpQuery)

  await context.github.issues.createComment(context.issue({ body: result.message }))
}

export default giveUp

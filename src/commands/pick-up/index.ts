// eslint-disable-next-line no-unused-vars
import { Context } from 'probot'

// eslint-disable-next-line no-unused-vars
import PickUpService from '../../services/pick-up'
// eslint-disable-next-line no-unused-vars
import { PickUpQuery } from '../queries/PickUpQuery'
// eslint-disable-next-line no-unused-vars
import { LabelQuery } from '../queries/LabelQuery'
import { Status } from '../../services/responses'
// eslint-disable-next-line no-unused-vars
import { Config, DEFAULT_CONFIG_FILE_PATH } from '../../config/Config'
import { PICKED_LABEL } from '../labels'

const pickUp = async (context: Context, pickUpService: PickUpService) => {
  const issueResponse = await context.github.issues.get(context.issue())
  const issue = context.issue()
  const { data } = issueResponse
  const { sender } = context.payload
  const labels: LabelQuery[] = data.labels.map(label => {
    return {
      ...label
    }
  })
  const { user } = data
  const config = await context.config<Config>(DEFAULT_CONFIG_FILE_PATH)

  const pickUpQuery: PickUpQuery = {
    challenger: sender.login,
    ...issue,
    issue: {
      ...data,
      user: {
        ...user
      },
      labels: labels,
      // @ts-ignore
      closedAt: data.closed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    },
    defaultSigLabel: config?.defaultSigLabel
  }

  const result = await pickUpService.pickUp(pickUpQuery)

  switch (result.status) {
    case Status.Failed: {
      context.log.error(`Pick up ${pickUpQuery} failed because ${result.message}.`)
      break
    }
    case Status.Success: {
      // Add picked label.
      await context.github.issues.addLabels(context.issue({ labels: [PICKED_LABEL] }))
      context.log.info(`Pick up ${pickUpQuery} success.`)
      break
    }
  }
  await context.github.issues.createComment(context.issue({ body: result.message }))
}

export default pickUp

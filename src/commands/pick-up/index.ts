// eslint-disable-next-line no-unused-vars
import { Context } from 'probot'
// eslint-disable-next-line no-unused-vars
import PickUpService from '../../services/pick-up'
// eslint-disable-next-line no-unused-vars
import { PickUpQuery } from '../queries/PickUpQuery'
// eslint-disable-next-line no-unused-vars
import { LabelQuery } from '../queries/LabelQuery'

const pickUp = async (context: Context, pickUpService: PickUpService) => {
  const issueResponse = await context.github.issues.get(context.issue())
  const issue = context.issue()
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

  const issueQuery: PickUpQuery = {
    challenger: sender.login,
    owner: issue.owner,
    repo: issue.repo,
    issue: {
      id: data.id,
      url: data.url,
      number: data.number,
      state: data.state,
      title: data.title,
      body: data.body,
      user: {
        login: data.user.login,
        id: data.user.id,
        type: data.user.type
      },
      labels: labels,
      // @ts-ignore
      closedAt: data.closed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  const result = await pickUpService.pickUp(issueQuery)

  await context.github.issues.createComment(context.issue({ body: result.message }))
}

export default pickUp

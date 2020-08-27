// eslint-disable-next-line no-unused-vars
import { Context } from 'probot'
// eslint-disable-next-line no-unused-vars
import RewardService from '../../services/reward'
// eslint-disable-next-line no-unused-vars
import { RewardQuery } from '../queries/RewardQuery'
// eslint-disable-next-line no-unused-vars
import { LabelQuery } from '../queries/LabelQuery'

const reward = async (context: Context, rewardData: number, rewardService: RewardService) => {
  const pullResponse = await context.github.pulls.get(context.issue())
  const { data } = pullResponse
  const { sender } = context.payload
  const labels: LabelQuery[] = data.labels.map(label => {
    return {
      id: label.id,
      name: label.name,
      description: label.description,
      default: label.default
    }
  })
  const issue = context.issue()

  const rewardQuery: RewardQuery = {
    mentor: sender.login,
    owner: issue.owner,
    repo: issue.repo,
    pull: {
      id: data.id,
      number: data.number,
      state: data.state,
      title: data.title,
      user: {
        login: data.user.login,
        id: data.user.id,
        type: data.user.type
      },
      body: data.body,
      labels: labels,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      closedAt: data.closed_at,
      mergedAt: data.merged_at,
      authorAssociation: data.author_association
    },
    reward: rewardData
  }

  const result = await rewardService.reward(rewardQuery)

  await context.github.issues.createComment(context.issue({ body: result.message }))
}

export default reward

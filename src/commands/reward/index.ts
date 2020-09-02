// eslint-disable-next-line no-unused-vars
import { Context } from 'probot'

// eslint-disable-next-line no-unused-vars
import RewardService from '../../services/reward'
// eslint-disable-next-line no-unused-vars
import { RewardQuery } from '../queries/RewardQuery'
// eslint-disable-next-line no-unused-vars
import { LabelQuery } from '../queries/LabelQuery'
import { Status } from '../../services/responses'
import { REWARDED_LABEL } from "../labels";

const reward = async (context: Context, rewardData: number, rewardService: RewardService) => {
  const pullResponse = await context.github.pulls.get(context.issue())
  const { data } = pullResponse
  const { sender } = context.payload
  const labels: LabelQuery[] = data.labels.map(label => {
    return {
      ...label
    }
  })
  const issue = context.issue()
  const { user } = data

  const rewardQuery: RewardQuery = {
    mentor: sender.login,
    ...issue,
    pull: {
      ...data,
      user: {
        ...user
      },
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

  switch (result.status) {
    case Status.Failed: {
      context.log.error(`Reward ${rewardQuery} failed because ${result.message}.`)
      break
    }
    case Status.Success: {
      // Add rewarded label.
      await context.github.issues.addLabels(context.issue({labels:[REWARDED_LABEL]}))
      context.log.info(`Reward ${rewardQuery} success.`)
      break
    }
  }

  await context.github.issues.createComment(context.issue({ body: result.message }))
}

export default reward

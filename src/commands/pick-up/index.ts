// eslint-disable-next-line no-unused-vars
import { Context } from 'probot'

const pickUp = async (context: Context, assignees: string[]) => {
  await context.github.issues.addAssignees(context.issue({ assignees }))
}

export { pickUp }

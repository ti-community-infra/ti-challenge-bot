import { Application, Context } from 'probot' // eslint-disable-line no-unused-vars

// @ts-ignore
import commands from 'probot-commands-pro'

export = (app: Application) => {
  commands(app, 'ping-challenge-bot', async (context: Context) => {
    await context.github.issues.createComment(context.issue({ body: 'pong!' }))
  })
  commands(app, 'pick-up', async (context: Context) => {
    await context.github.issues.createComment(context.issue({ body: 'Thanks for your pick-up!' }))
  })
  commands(app, 'give-up', async (context: Context) => {
    await context.github.issues.createComment(context.issue({ body: 'Thanks for your give-up!' }))
  })
  commands(app, 'reward', async (context: Context, command: any) => {
    const score = command.arguments
    await context.github.issues.createComment(context.issue({ body: `Thanks for your reward! Your reward score is: ${score}` }))
  })
}

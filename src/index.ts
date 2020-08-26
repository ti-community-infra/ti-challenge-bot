// eslint-disable-next-line no-unused-vars
import { Application, Context } from 'probot'
import { createConnection } from 'typeorm'
import pickUp from './commands/pick-up'

const commands = require('probot-commands-pro')

export = (app: Application) => {
  createConnection().then(() => {
    app.log.info('Connect to db success')
    commands(app, 'ping', async (context: Context) => {
      await context.github.issues.createComment(context.issue({ body: 'pong! I am challenge bot.' }))
    })

    commands(app, 'pick-up', async (context: Context) => {
      await pickUp(context)
    })

    commands(app, 'give-up', async (context: Context) => {
      await context.github.issues.createComment(context.issue({ body: 'Thanks for your give-up!' }))
    })

    commands(app, 'reward', async (context: Context, command: any) => {
      const score = command.arguments
      await context.github.issues.createComment(context.issue({ body: `Thanks for your reward! Your reward score is: ${score}` }))
    })
  }).catch(err => {
    app.log.fatal('Connect to db failed', err)
  })
}

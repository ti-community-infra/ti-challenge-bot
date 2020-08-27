// eslint-disable-next-line no-unused-vars
import { Application, Context } from 'probot'
import 'reflect-metadata'
import { createConnection, useContainer } from 'typeorm'
import { Container } from 'typedi'
import pickUp from './commands/pick-up'
import PickUpService from './services/pick-up'
import giveUp from './commands/give-up'
import GiveUpService from './services/give-up'

const commands = require('probot-commands-pro')

export = (app: Application) => {
  useContainer(Container)

  createConnection().then(() => {
    app.log.info('Connect to db success')

    commands(app, 'ping', async (context: Context) => {
      await context.github.issues.createComment(context.issue({ body: 'pong! I am challenge bot.' }))
    })

    commands(app, 'pick-up', async (context: Context) => {
      await pickUp(context, Container.get(PickUpService))
    })

    commands(app, 'give-up', async (context: Context) => {
      await giveUp(context, Container.get(GiveUpService))
    })

    commands(app, 'reward', async (context: Context, command: any) => {
      const score = command.arguments
      await context.github.issues.createComment(context.issue({ body: `Thanks for your reward! Your reward score is: ${score}` }))
    })
  }).catch(err => {
    app.log.fatal('Connect to db failed', err)
  })
}

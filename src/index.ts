// eslint-disable-next-line no-unused-vars
import { Application, Context } from 'probot'
import 'reflect-metadata'
import { createConnection, useContainer } from 'typeorm'
import { Container } from 'typedi'
import pickUp from './commands/pick-up'
import PickUpService from './services/pick-up'
import giveUp from './commands/give-up'
import GiveUpService from './services/give-up'
import reward from './commands/reward'
import RewardService from './services/reward'

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

    commands(app, 'reward', async (context: Context, command: { arguments: string }) => {
      const rewardData = command.arguments
      if (!Number.isInteger(rewardData)) {
        await context.github.issues.createComment(context.issue({ body: 'The reward invalid.' }))
        return
      }
      await reward(context, Number(rewardData), Container.get(RewardService))
    })
  }).catch(err => {
    app.log.fatal('Connect to db failed', err)
  })
}

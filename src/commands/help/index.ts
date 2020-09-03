// eslint-disable-next-line no-unused-vars
import { Context } from 'probot'

const helpMessage = `
Usage:

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**/command [argument]**

The commands are: 

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**/ping**&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ping the bot
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**/pick-up**&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;pick up the issue
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**/give-up**&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;give up the issue
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**/reward score**&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;reward the score to PR
    
----------------------------------------------------------------------------------------------------------
>You can find more details on [challenge-bot-docs](https://tidb-community-bots.github.io/challenge-bot/).
>
>If you think there is a problem, you can report bug on [report-a-bug](https://github.com/tidb-community-bots/challenge-bot/issues/new/choose).
>
>If you think the bot is dead, please contact [Rustin-Liu](https://github.com/Rustin-Liu) to fix it.
`
const help = async (context: Context) => {
  await context.github.issues.createComment(context.issue({ body: helpMessage }))
}

export default help

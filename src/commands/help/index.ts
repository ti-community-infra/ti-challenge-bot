import { Context } from "probot";
import { createOrUpdateNotification } from "../common/issue-update";
const helpMessage = `
Usage:

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**/command [argument]**

The commands are: 

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**/ping**&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ping the bot
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**/pick-up**&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;pick up the issue
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**/give-up**&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;give up the issue
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**/reward score**&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;reward the score to PR
    
----------------------------------------------------------------------------------------------------------
<details>
<summary>More Details</summary>

>You can find more details on [ti-challenge-bot-docs](https://tidb-community-bots.github.io/ti-challenge-bot/).
>
>If you think there is a problem, you can report bug on [report-a-bug](https://github.com/tidb-community-bots/ti-challenge-bot/issues/new/choose).
>
>If you think the bot is dead, please contact [Rustin-Liu](https://github.com/Rustin-Liu) to fix it.
</details>
`;
const help = async (context: Context) => {
  await createOrUpdateNotification(context, helpMessage);
};

export default help;

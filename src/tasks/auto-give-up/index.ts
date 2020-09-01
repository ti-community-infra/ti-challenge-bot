import {Context} from "probot";
import AutoGiveUpService from "../../services/auto-give-up";
import {AutoGiveUpQuery} from "../../commands/queries/AutoGiveUpQuery";

const autoGiveUp = async (context: Context, autoGiveUpService: AutoGiveUpService) => {
    const autoGiveUpQuery: AutoGiveUpQuery = {
        ...context.issue()
    }

    const messages = await autoGiveUpService.autoGiveUp(autoGiveUpQuery)

    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i]
        await context.github.issues.createComment({...msg,body: msg.message})
    }
}

export default autoGiveUp

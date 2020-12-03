import { Context } from "probot";
import AutoGiveUpService from "../../services/auto-give-up";
import { AutoGiveUpQuery } from "../../queries/AutoGiveUpQuery";
import { PICKED_LABEL } from "../../commands/labels";

import { Config, DEFAULT_CONFIG_FILE_PATH } from "../../config/Config";

const autoGiveUp = async (
  context: Context,
  autoGiveUpService: AutoGiveUpService
) => {
  const config = await context.config<Config>(DEFAULT_CONFIG_FILE_PATH);

  const autoGiveUpQuery: AutoGiveUpQuery = {
    ...context.issue(),
    timeout: config?.timeout,
  };

  const autoGiveUpResults = await autoGiveUpService.autoGiveUp(autoGiveUpQuery);

  for (let i = 0; i < autoGiveUpResults.length; i++) {
    const result = autoGiveUpResults[i];
    await context.github.issues.createComment({
      ...result,
      body: result.message,
    });
    await context.github.issues.removeLabel({ ...result, name: PICKED_LABEL });
    context.log.info(`Auto give up ${result} success.`);
  }
};

export default autoGiveUp;

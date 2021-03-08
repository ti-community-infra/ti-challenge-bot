import "reflect-metadata";

import { ApplicationFunctionOptions, Context, Probot } from "probot";
import { EventPayloads } from "@octokit/webhooks";
import { createConnection, useContainer } from "typeorm";
import { Container } from "typedi";

import pickUp from "./commands/pick-up";
import reward from "./commands/reward";
import help from "./commands/help";
import giveUp from "./commands/give-up";
import autoGiveUp from "./tasks/auto-give-up";

import { handlePullEvents } from "./events/pull";
import handleIssueEvents from "./events/issues";
import { handleLgtm } from "./events/custom";

import AutoGiveUpService from "./services/auto-give-up";
import IssueService from "./services/issue";
import ChallengeIssueService, {
  IChallengeIssueServiceToken,
} from "./services/challenge-issue";
import ChallengePullService, {
  IChallengePullServiceToken,
} from "./services/challenge-pull";
import ChallengeTeamService from "./services/challenge-team";
import ChallengeProgramService from "./services/challenge-program";

import createTeam from "./api/challenge-team";
import { findAllChallengePrograms, ranking } from "./api/challenge-program";

const commands = require("probot-commands-pro");
const createScheduler = require("probot-scheduler-pro");
const bodyParser = require("body-parser");
const cors = require("cors");
const allowedAccounts = (process.env.ALLOWED_ACCOUNTS || "")
  .toLowerCase()
  .split(",");

const SCHEDULE_REPOSITORY_EVENT: any = "schedule.repository";

export = async (app: Probot, { getRouter }: ApplicationFunctionOptions) => {
  useContainer(Container);

  createScheduler(app);

  // TODO: Use a new way to output logs.

  // Get an express router to expose new HTTP endpoints.
  if (!getRouter) {
    app.log.fatal("Failed to obtain getRouter.");
    return;
  }

  const router = getRouter("/ti-challenge-bot");
  router.use(bodyParser.json());
  router.use(cors());

  createConnection()
    .then(() => {
      app.log.info("App starting...");

      commands(app, "ping", async (context: Context) => {
        await context.octokit.issues.createComment(
          context.issue({
            body: "pong! I am challenge bot.",
          })
        );
      });

      commands(app, "help", async (context: Context) => {
        await help(context);
      });

      commands(
        app,
        "pick-up",
        async (context: Context<EventPayloads.WebhookPayloadIssueComment>) => {
          await pickUp(context, Container.get(IChallengeIssueServiceToken));
        }
      );

      commands(
        app,
        "give-up",
        async (context: Context<EventPayloads.WebhookPayloadIssueComment>) => {
          await giveUp(context, Container.get(IChallengeIssueServiceToken));
        }
      );

      commands(
        app,
        "reward",
        async (
          context: Context<EventPayloads.WebhookPayloadIssueComment>,
          command: { arguments: string }
        ) => {
          const rewardData = command.arguments;
          const rewardValue = Number(rewardData);
          if (!Number.isInteger(rewardValue)) {
            await context.octokit.issues.createComment(
              context.issue({ body: "The reward invalid." })
            );
            return;
          }

          await reward(
            context,
            rewardValue,
            Container.get(IChallengePullServiceToken)
          );
        }
      );

      app.on("issue_comment.created", async (context) => {
        const { comment } = context.payload;
        if (comment.body.toLowerCase().includes("lgtm")) {
          await handleLgtm(context, Container.get(ChallengePullService));
        }
      });

      app.on("issues", async (context) => {
        await handleIssueEvents(
          context,
          Container.get(IssueService),
          Container.get(ChallengeIssueService)
        );
      });

      app.on("pull_request", async (context) => {
        await handlePullEvents(context, Container.get(ChallengePullService));
      });

      app.on(SCHEDULE_REPOSITORY_EVENT, async (context) => {
        app.log.info("Scheduling coming...");
        await autoGiveUp(context, Container.get(AutoGiveUpService));
      });

      // TODO: move this into events.
      app.on("installation.created", async (context) => {
        const { installation } = context.payload;
        // Notice: if not allowed account we need to uninstall itself.
        if (!allowedAccounts.includes(installation.account.login)) {
          app.log.warn(`Uninstall app from ${installation.account.login}.`);
          // FIXME: https://github.com/probot/probot/issues/1003.
          const github = await app.auth();
          await github.apps.deleteInstallation({
            installation_id: installation.id,
          });
        }
      });

      router.post("/teams", async (req, res) => {
        await createTeam(req, res, Container.get(ChallengeTeamService));
      });

      router.get("/programs", async (req, res) => {
        await findAllChallengePrograms(
          req,
          res,
          Container.get(ChallengeProgramService)
        );
      });

      router.get("/program/:id/ranks", async (req, res) => {
        await ranking(req, res, Container.get(ChallengeProgramService));
      });
    })
    .catch((err) => {
      // TODO: this log format is wrong.
      app.log.fatal(err, "Connect to db failed.");
    });
};

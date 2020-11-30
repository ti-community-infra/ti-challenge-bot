import nock from "nock";
import { Context } from "probot";
import pickUp from "../../../src/commands/pick-up";
import typeorm = require("typeorm");
import { GitHubAPI } from "probot/lib/github";
import ChallengeIssueService from "../../../src/services/challenge-issue";
import { LoggerWithTarget } from "probot/lib/wrap-logger";
import Webhooks from "@octokit/webhooks";
import { ChallengeIssueWarning } from "../../../src/services/messages/ChallengeIssueMessage";
import pickUpPayload from "../../fixtures/issues.pickup.comment.json";

describe("Pick Up Command", () => {
  beforeEach(() => {
    // Mock the db connection.
    typeorm.createConnection = jest.fn().mockResolvedValue(null);
    nock.disableNetConnect();
  });

  test("Pick up a pull request", async (done) => {
    // Mock the `issue.get()` API, so that it returned the `pull_request` attribute
    const mockGithub = ({
      issues: {
        get() {
          return new Promise((resolve) => {
            resolve({
              data: {
                labels: [],
                pull_request: {},
              },
            });
          });
        },
      },
    } as unknown) as GitHubAPI;

    // Mock the logger
    const mockLogger = ({
      warn(message: string) {
        done(
          expect(message).toBe(
            ChallengeIssueWarning.NotAllowedToPickUpAPullRequest
          )
        );
      },
    } as unknown) as LoggerWithTarget;

    // Mock an event triggered by a comment with pick-up command
    const event = ({
      payload: pickUpPayload,
    } as unknown) as Webhooks.WebhookEvent<{}>;

    const mockContext = new Context<{}>(event, mockGithub, mockLogger);

    jest.spyOn(mockContext, "config").mockResolvedValue(undefined);

    const mockChallengeIssueService = ({} as unknown) as ChallengeIssueService;

    await pickUp(mockContext, mockChallengeIssueService);
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });
});

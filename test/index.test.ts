import nock from "nock";
import typeorm = require("typeorm");
import Container, { Service } from "typedi";

// Requiring our app implementation
import myProbotApp from "../src";
import { Probot, ProbotOctokit, Server } from "probot";
import {
  IChallengeIssueService,
  IChallengeIssueServiceToken,
} from "../src/services/challenge-issue";

// Requiring our fixtures
import payload from "./fixtures/issues.ping.comment.json";
import pickUpPayload from "./fixtures/pulls.pickup.comment.json";
import giveUpPayload from "./fixtures/pulls.giveup.comment.json";

const pongBody = { body: "pong! I am challenge bot." };
const fs = require("fs");
const path = require("path");

const privateKey = fs.readFileSync(
  path.join(__dirname, "fixtures/mock-cert.pem"),
  "utf-8"
);

describe("My Probot app", () => {
  let probot: Probot;

  const mockGiveUpMethod = jest.fn();
  const mockPickUpMethod = jest.fn();

  beforeAll(() => {
    // Mock the challenge-issue service.
    @Service(IChallengeIssueServiceToken)
    // TODO: remove the experimentalDecorators warning.
    class MockChallengeIssueService implements IChallengeIssueService {
      giveUp = mockGiveUpMethod.mockResolvedValue(undefined);
      createWhenIssueOpened = jest.fn().mockResolvedValue(undefined);
      updateWhenIssueEdited = jest.fn().mockResolvedValue(undefined);
      removeWhenIssueUnlabeled = jest.fn().mockResolvedValue(undefined);
      pickUp = mockPickUpMethod.mockResolvedValue(undefined);
    }

    Container.set(IChallengeIssueServiceToken, new MockChallengeIssueService());
  });

  beforeEach(async () => {
    // @ts-ignore
    typeorm.createConnection = jest.fn().mockResolvedValue(null);
    nock.disableNetConnect();
    // Load our app into probot
    let server = new Server({
      Probot: Probot.defaults({
        appId: 123,
        privateKey: privateKey,
        secret: "secret",
        // disable request throttling and retries for testing
        Octokit: ProbotOctokit.defaults({
          retry: { enabled: false },
          throttle: { enabled: false },
        }),
      }),
    });
    probot = server.probotApp;
    await server.load(myProbotApp);
  });

  test("creates a comment with ping command to an issue", async (done) => {
    // Test that we correctly return a test token
    nock("https://api.github.com")
      .post("/app/installations/2/access_tokens")
      .reply(200, { token: "test" })
      .get("/app/installations?per_page=100")
      .reply(200, {
        account: {
          login: "ti-community-infra",
        },
      });

    // Test that a comment is posted
    nock("https://api.github.com")
      .post(
        "/repos/Rustin-Liu/ti-challenge-bot/issues/1/comments",
        (body: any) => {
          done(expect(body).toMatchObject(pongBody));
          return true;
        }
      )
      .reply(200);

    // Receive a webhook event
    await probot.receive({ id: "1", name: "issue_comment", payload });
  });

  test("creates a comment with pick-up command to a pull request", async () => {
    nock("https://api.github.com")
      .post("/app/installations/2/access_tokens")
      .reply(200, { token: "test" })
      .get("/app/installations?per_page=100")
      .reply(200, [])
      // Notice: Actually, it returns the pull request information here.
      .get(`/repos/Rustin-Liu/ti-challenge-bot/issues/1`)
      .reply(200, {
        id: 1,
        number: 1,
        state: "open",
        body: "I'm having a problem with this.",
        labels: [],
        user: {
          login: "Rustin-Liu",
          id: 1,
        },
        pull_request: {},
      })
      .get(
        "/repos/Rustin-Liu/ti-challenge-bot/contents/.github/challenge-bot.yml"
      )
      .reply(200, {
        type: "file",
        encoding: "base64",
        size: 5362,
        name: "challenge-bot.yml",
        path: ".github/challenge-bot.yml",
        content: "",
        sha: "3d21ec53a331a6f037a91c368710b99387d012c1",
        url:
          "https://api.github.com/repos/Rustin-Liu/ti-challenge-bot/contents/.github/challenge-bot.yml",
      });

    // Receive a webhook event.
    await probot.receive({
      id: "1000",
      name: "issue_comment",
      payload: pickUpPayload,
    });

    // If the robot receive a pick-up command to a pull request, the `pickUp` method will not be called.
    expect(mockPickUpMethod).not.toHaveBeenCalled();
  });

  test("creates a comment with give-up command to a pull request", async () => {
    nock("https://api.github.com")
      .post("/app/installations/2/access_tokens")
      .reply(200, { token: "test" })
      .get("/app/installations?per_page=100")
      .reply(200, [])
      // Notice: Actually, it returns the pull request information here.
      .get(`/repos/Rustin-Liu/ti-challenge-bot/issues/1`)
      .reply(200, {
        id: 1,
        number: 1,
        state: "open",
        body: "I'm having a problem with this.",
        labels: [],
        user: {
          login: "Rustin-Liu",
          id: 1,
        },
        pull_request: {},
      })
      .get(
        "/repos/Rustin-Liu/ti-challenge-bot/contents/.github/challenge-bot.yml"
      )
      .reply(200, {
        type: "file",
        encoding: "base64",
        size: 5362,
        name: "challenge-bot.yml",
        path: ".github/challenge-bot.yml",
        content: "",
        sha: "3d21ec53a331a6f037a91c368710b99387d012c1",
        url:
          "https://api.github.com/repos/Rustin-Liu/ti-challenge-bot/contents/.github/challenge-bot.yml",
      });

    // Receive a webhook event.
    await probot.receive({
      id: "1000",
      name: "issue_comment",
      payload: giveUpPayload,
    });

    // If the robot receive a give-up command to a pull request, the `giveUp` method will not be called.
    expect(mockGiveUpMethod).not.toHaveBeenCalled();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });
});

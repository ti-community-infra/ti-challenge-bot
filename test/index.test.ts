// You can import your modules
// import index from '../src/index'

import nock from "nock";
import typeorm = require("typeorm");

// Requiring our app implementation
import myProbotApp from "../src";
import { Probot } from "probot";

// Requiring our fixtures
import payload from "./fixtures/issues.ping.comment.json";
import pickUpPayload from "./fixtures/pulls.pickup.comment.json";

const pongBody = { body: "pong! I am challenge bot." };
const fs = require("fs");
const path = require("path");

// Mock the challenge-issue service
jest.mock("../src/services/challenge-issue/index");

describe("My Probot app", () => {
  let probot: any;
  let mockCert: string;

  beforeAll((done: Function) => {
    fs.readFile(
      path.join(__dirname, "fixtures/mock-cert.pem"),
      (err: Error, cert: string) => {
        if (err) return done(err);
        mockCert = cert;
        done();
      }
    );
  });

  beforeEach(() => {
    // @ts-ignore
    typeorm.createConnection = jest.fn().mockResolvedValue(null);
    nock.disableNetConnect();
    probot = new Probot({ id: 123, cert: mockCert });
    // Load our app into probot
    probot.load(myProbotApp);
  });

  test("creates a comment when an issue is opened", async (done) => {
    // Test that we correctly return a test token
    nock("https://api.github.com")
      .post("/app/installations/2/access_tokens")
      .reply(200, { token: "test" });

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
    await probot.receive({ name: "issue_comment", payload });
  });

  test("creates a comment with pick-up command to a pull request", async (done) => {
    nock("https://api.github.com")
      .post("/app/installations/2/access_tokens")
      .reply(200, { token: "test" })
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
        "/repos/Rustin-Liu/ti-challenge-bot/contents/.github/challenge-bot.yml",
        (body) => {
          // If the robot regards a pull request as an issue mistakenly, it will request this API, so that the body must not be undefined
          expect(body).toBeUndefined();
          done();
          return true;
        }
      )
      .reply(200);

    // Receive a webhook event
    await probot.receive({ name: "issue_comment", payload: pickUpPayload });

    done();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });
});

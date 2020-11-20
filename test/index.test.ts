// You can import your modules
// import index from '../src/index'

import nock from "nock";
// Requiring our app implementation
import myProbotApp from "../src";
import { Probot } from "probot";

// Requiring our fixtures
import payload from "./fixtures/issues.ping.comment.json";
import typeorm = require("typeorm");
const pongBody = {
  body:
    "\r\n\r\n-------------------------------\r\n\r\n## :warning:Notification:warning:\r\n\r\npong! I am challenge bot.<!-- probot:Notification -->\r\n\r\n",
};
const fs = require("fs");
const path = require("path");

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
      .reply(200, {
        token: "test",
        permissions: {
          issues: "write",
        },
      });

    nock("https://api.github.com")
      .get("/repos/Rustin-Liu/ti-challenge-bot/issues/1")
      .reply(200, {
        owner: "Rustin-Liu",
        repo: "ti-challenge-bot",
        number: 1,
        body: "",
      });

    nock("https://api.github.com")
      .patch("/repos/Rustin-Liu/ti-challenge-bot/issues/1", (body: any) => {
        done(expect(body).toMatchObject(pongBody));
        return true;
      })
      .reply(200);

    // Test that a comment is posted
    nock("https://api.github.com")
      .post("/repos/Rustin-Liu/ti-challenge-bot/issues/1/comments")
      .reply(200);

    // Receive a webhook event
    await probot.receive({ name: "issue_comment", payload });
  }, 100000);

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });
});

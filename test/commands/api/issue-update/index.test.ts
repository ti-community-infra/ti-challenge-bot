import nock from "nock";
import myProbotApp from "../../../../src";
import { Probot } from "probot";
import {
  updateNotification,
  updateStatus,
} from "../../../../src/commands/api/issue-update/issue-update";

import payload from "../../../../test/fixtures/issues.ping.comment.json";
import typeorm = require("typeorm");

const fs = require("fs");
const path = require("path");

const issueBodyTemplate = `
## Description

这是一段背景

## Tasks

- 任务1
- 任务2

## Score

- 100

## Mentor

- @rust-in

## Recommended Skills
- Go
- MarkDown

## Learning Materials(optional)`;

const notificationHead = `


## :warning:Notification:warning:

pong! I am challenge bot.<!-- probot:Notification -->

`;

describe("Issue Update", () => {
  let probot: any;
  let mockCert: string;

  beforeAll((done: Function) => {
    fs.readFile(
      path.join(__dirname, "../../../fixtures/mock-cert.pem"),
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

    nock("https://api.github.com")
      .post("/app/installations/2/access_tokens")
      .reply(200, {
        token: "test",
        permissions: {
          issues: "write",
        },
      });
  });

  test("updateNotification function test", () => {
    const case1: [string, string, string, string][] = [
      [
        "this is a message",
        `
        tidb
        tikv
`,
        "asuka730",
        `
        tidb
        tikv



## :warning:Notification:warning:

@asuka730 this is a message<!-- probot:Notification -->

`,
      ],
    ];
    const case2: [string, string, undefined, string][] = [
      [
        "this is a message",
        `
        tidb
        tikv
`,
        undefined,
        `
        tidb
        tikv



## :warning:Notification:warning:

this is a message<!-- probot:Notification -->

`,
      ],
    ];

    case1.forEach((c) => {
      expect(updateNotification(c[0], c[1], c[2])).toBe(c[3]);
    });
    case2.forEach((c) => {
      expect(updateNotification(c[0], c[1], c[2])).toBe(c[3]);
    });
  });

  test("updateStatus function test", () => {
    const case1: [string, string, string, string][] = [
      [
        `
        tidb
        tikv
`,
        "asuka730",
        "chanllenge1",
        `
        tidb
        tikv



## Status

&nbsp;&nbsp;Current challenger: @asuka730
&nbsp;&nbsp;Current Program: chanllenge1
<!-- probot:Status -->

`,
      ],
    ];

    const case2: [string, string, undefined, string][] = [
      [
        `
        tidb
        tikv
`,
        "asuka730",
        undefined,
        `
        tidb
        tikv



## Status

&nbsp;&nbsp;Current challenger: @asuka730
<!-- probot:Status -->

`,
      ],
    ];
    const case3: [string, undefined, undefined, string][] = [
      [
        `
        tidb
        tikv
`,
        undefined,
        undefined,
        `
        tidb
        tikv



## Status

&nbsp;&nbsp; The challenge has not picked yet.
<!-- probot:Status -->

`,
      ],
    ];

    case1.forEach((c) => {
      expect(updateStatus(c[0], c[1], c[2])).toBe(c[3]);
    });
    case2.forEach((c) => {
      expect(updateStatus(c[0], c[1], c[2])).toBe(c[3]);
    });
    case3.forEach((c) => {
      expect(updateStatus(c[0], c[1], c[2])).toBe(c[3]);
    });
  });

  test("ping in an empty issue", async (done) => {
    const issueBody = {
      body: notificationHead,
    };

    // mock Context.issue
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
        done(expect(body).toMatchObject(issueBody));
        return true;
      })
      .reply(200);
    await probot.receive({ name: "issue_comment", payload });
  });

  test("ping in an normal issue", async (done) => {
    const issueBody = { body: issueBodyTemplate + notificationHead };
    // mock Context.issue
    nock("https://api.github.com")
      .get("/repos/Rustin-Liu/ti-challenge-bot/issues/1")
      .reply(200, {
        owner: "Rustin-Liu",
        repo: "ti-challenge-bot",
        number: 1,
        body: issueBodyTemplate,
      });

    // mock update operation
    nock("https://api.github.com")
      .patch("/repos/Rustin-Liu/ti-challenge-bot/issues/1", (body: any) => {
        done(expect(body).toMatchObject(issueBody));
        return true;
      })
      .reply(200);
    await probot.receive({ name: "issue_comment", payload });
  });

  test("create an issue by rebot.", async (done) => {
    const issueBody = { body: issueBodyTemplate + notificationHead };
    // mock Context.issue
    nock("https://api.github.com")
      .get("/repos/Rustin-Liu/ti-challenge-bot/issues/1")
      .reply(200, {
        owner: "Rustin-Liu",
        repo: "ti-challenge-bot",
        number: 1,
        body: issueBodyTemplate,
      });

    // mock update operation
    nock("https://api.github.com")
      .patch("/repos/Rustin-Liu/ti-challenge-bot/issues/1", (body: any) => {
        done(expect(body).toMatchObject(issueBody));
        return true;
      })
      .reply(200);
    await probot.receive({ name: "issue_comment", payload });
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });
});

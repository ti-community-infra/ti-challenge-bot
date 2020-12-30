import ChallengePullService from "../../../lib/services/challenge-pull";
import { Repository } from "typeorm/repository/Repository";
import { Issue } from "../../../lib/db/entities/Issue";
import { ChallengePull } from "../../../lib/db/entities/ChallengePull";
import { Pull } from "../../../lib/db/entities/Pull";
import ScoreRepository from "../../../lib/repositoies/score";
import { PullPayload } from "../../../lib/events/payloads/PullPayload";

describe("ChallengePull Service", () => {
  let challengePullService: ChallengePullService;
  let issueRepository: Repository<Issue> = new Repository<Issue>();
  let challengePullRepository: Repository<ChallengePull> = new Repository<ChallengePull>();
  let pullRepository: Repository<Pull> = new Repository<Pull>();
  let scoreRepository: ScoreRepository = new ScoreRepository();

  beforeEach(() => {
    challengePullService = new ChallengePullService(
      issueRepository,
      challengePullRepository,
      pullRepository,
      scoreRepository
    );
  });

  test("a right test", async () => {
    expect.assertions(1);

    let issue: Issue = <Issue>{
      id: 93,
      issueNumber: 36,
    };
    let issueFindOneMock = jest.spyOn(issueRepository, "findOne");
    issueFindOneMock.mockResolvedValue(issue);

    let pull: Pull = <Pull>{
      id: 35,
      pullNumber: 37,
    };
    let pullFindOneMock = jest.spyOn(pullRepository, "findOne");
    pullFindOneMock.mockResolvedValue(pull);

    let cpFindOneMock = jest.spyOn(challengePullRepository, "findOne");
    cpFindOneMock.mockResolvedValue(new ChallengePull());

    let cpSaveMock = jest.spyOn(challengePullRepository, "save");
    cpSaveMock.mockResolvedValue(new ChallengePull());

    let scoreFindOneMock = jest.spyOn(
      scoreRepository,
      "getCurrentIssueLeftScore"
    );
    scoreFindOneMock.mockResolvedValue(100);

    const ret = await challengePullService.awardWhenPullClosedAndContainClose(<
      PullPayload
    >{
      action: "",
      number: 0,
      pull: { body: "Issue Number: close #36 " },
    });
    expect(ret).toBe(true);
  });

  test("not contains close", async () => {
    const cases = [
      ["Issue Number: #100", false],
      [
        `
        tidb
        tikv
        pd
        ...
        ...
        Issue Number: #200
        `,
        false,
      ],
      ["Issue Number: https://github.com/test/test/issues/19971", false],
      ["Issue Number: close https://github.com/test/test/issues/19971", true],
    ];

    for (const c of cases) {
      let issue: Issue = <Issue>{
        id: 93,
        issueNumber: 36,
      };
      let issueFindOneMock = jest.spyOn(issueRepository, "findOne");
      issueFindOneMock.mockResolvedValue(issue);

      let pull: Pull = <Pull>{
        id: 35,
        pullNumber: 37,
      };
      let pullFindOneMock = jest.spyOn(pullRepository, "findOne");
      pullFindOneMock.mockResolvedValue(pull);

      let cpFindOneMock = jest.spyOn(challengePullRepository, "findOne");
      cpFindOneMock.mockResolvedValue(new ChallengePull());

      let cpSaveMock = jest.spyOn(challengePullRepository, "save");
      cpSaveMock.mockResolvedValue(new ChallengePull());

      let scoreFindOneMock = jest.spyOn(
        scoreRepository,
        "getCurrentIssueLeftScore"
      );
      scoreFindOneMock.mockResolvedValue(100);
      const ret = await challengePullService.awardWhenPullClosedAndContainClose(
        <PullPayload>{
          action: "",
          number: 0,
          pull: { body: c[0] },
        }
      );
      expect(ret).toEqual(c[1]);
    }
  });

  test("Unable to parse correctly issueNumber", async () => {
    expect.assertions(1);
    let issue: Issue = <Issue>{
      id: 93,
      issueNumber: 36,
    };
    let issueFindOneMock = jest.spyOn(issueRepository, "findOne");
    issueFindOneMock.mockResolvedValue(issue);

    let pull: Pull = <Pull>{
      id: 35,
      pullNumber: 37,
    };
    let pullFindOneMock = jest.spyOn(pullRepository, "findOne");
    pullFindOneMock.mockResolvedValue(pull);

    let cpFindOneMock = jest.spyOn(challengePullRepository, "findOne");
    cpFindOneMock.mockResolvedValue(new ChallengePull());

    let cpSaveMock = jest.spyOn(challengePullRepository, "save");
    cpSaveMock.mockResolvedValue(new ChallengePull());

    let scoreFindOneMock = jest.spyOn(
      scoreRepository,
      "getCurrentIssueLeftScore"
    );
    scoreFindOneMock.mockResolvedValue(100);
    const ret = await challengePullService.awardWhenPullClosedAndContainClose(<
      PullPayload
    >{
      action: "",
      number: 0,
      pull: { body: "Issue Number: #ac " },
    });
    expect(ret).toBe(false);
  });

  test("Unable to query issue", async () => {
    expect.assertions(1);

    let issueFindOneMock = jest.spyOn(issueRepository, "findOne");
    issueFindOneMock.mockResolvedValue(undefined);

    let pullFindOneMock = jest.spyOn(pullRepository, "findOne");
    pullFindOneMock.mockResolvedValue(undefined);

    let cpFindOneMock = jest.spyOn(challengePullRepository, "findOne");
    cpFindOneMock.mockResolvedValue(new ChallengePull());

    let cpSaveMock = jest.spyOn(challengePullRepository, "save");
    cpSaveMock.mockResolvedValue(new ChallengePull());

    let scoreFindOneMock = jest.spyOn(
      scoreRepository,
      "getCurrentIssueLeftScore"
    );
    scoreFindOneMock.mockResolvedValue(100);

    const ret = await challengePullService.awardWhenPullClosedAndContainClose(<
      PullPayload
    >{
      action: "",
      number: 0,
      pull: { body: "Issue Number: close #36" },
    });
    expect(ret).toBe(false);
  });

  test("Unable to query currentLeftScore", async () => {
    expect.assertions(1);

    let issue: Issue = <Issue>{
      id: 93,
      issueNumber: 36,
    };
    let issueFindOneMock = jest.spyOn(issueRepository, "findOne");
    issueFindOneMock.mockResolvedValue(issue);

    let pull: Pull = <Pull>{
      id: 35,
      pullNumber: 37,
    };
    let pullFindOneMock = jest.spyOn(pullRepository, "findOne");
    pullFindOneMock.mockResolvedValue(pull);

    let cpFindOneMock = jest.spyOn(challengePullRepository, "findOne");
    cpFindOneMock.mockResolvedValue(new ChallengePull());

    let cpSaveMock = jest.spyOn(challengePullRepository, "save");
    cpSaveMock.mockResolvedValue(new ChallengePull());

    let scoreFindOneMock = jest.spyOn(
      scoreRepository,
      "getCurrentIssueLeftScore"
    );
    scoreFindOneMock.mockResolvedValue(undefined);
    const ret = await challengePullService.awardWhenPullClosedAndContainClose(<
      PullPayload
    >{
      action: "",
      number: 0,
      pull: { body: "Issue Number: close #36" },
    });
    expect(ret).toBe(false);
  });
});

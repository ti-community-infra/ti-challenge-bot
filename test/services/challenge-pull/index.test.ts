import ChallengePullService from "../../../lib/services/challenge-pull";
import { Repository } from "typeorm/repository/Repository";
import { Issue } from "../../../lib/db/entities/Issue";
import { ChallengePull } from "../../../lib/db/entities/ChallengePull";
import { Pull } from "../../../lib/db/entities/Pull";
import ScoreRepository from "../../../lib/repositoies/score";
import { PullPayload } from "../../../lib/events/payloads/PullPayload";

describe("ChallengePull Service", () => {
  let challengePullService: ChallengePullService;
  let issueRepository: Repository<Issue>;
  let challengePullRepository: Repository<ChallengePull>;
  let pullRepository: Repository<Pull>;
  let scoreRepository: ScoreRepository;

  let pullPayload: PullPayload = {
    action: "",
    number: 0,
    pull: {
      authorAssociation: "",
      body: "",
      closedAt: "",
      createdAt: "",
      id: 0,
      labels: [
        {
          default: false,
          description: "",
          id: 0,
          name: "",
        },
      ],
      mergedAt: "",
      number: 0,
      state: "",
      title: "",
      updatedAt: "",
      user: {
        id: 0,
        login: "",
        type: "",
      },
    },
  };

  issueRepository = new Repository<Issue>();
  challengePullRepository = new Repository<ChallengePull>();
  pullRepository = new Repository<Pull>();
  scoreRepository = new ScoreRepository();
  challengePullService = new ChallengePullService(
    issueRepository,
    challengePullRepository,
    pullRepository,
    scoreRepository
  );

  const scoreFindOneMock = jest.spyOn(
    scoreRepository,
    "getCurrentIssueLeftScore"
  );
  scoreFindOneMock.mockResolvedValue(100);

  let issueFindOneMock = jest.spyOn(issueRepository, "findOne");
  issueFindOneMock.mockResolvedValue(new Issue());

  const cpFindOneMock = jest.spyOn(challengePullRepository, "findOne");
  cpFindOneMock.mockResolvedValue(new ChallengePull());

  const pullFindOneMock = jest.spyOn(pullRepository, "findOne");
  pullFindOneMock.mockResolvedValue(new Pull());

  const cpSaveMock = jest.spyOn(challengePullRepository, "save");
  cpSaveMock.mockResolvedValue(new ChallengePull());

  test("a default test", async () => {
    expect.assertions(1);
    const ret = await challengePullService.awardWhenPullClosedAndContainClose(
      pullPayload
    );
    expect(ret).toBe(false);
  });

  test("a right test", async () => {
    expect.assertions(1);

    pullPayload.pull.body = "- Issue Number: close #36 ";

    let issue = new Issue();
    issue.id = 93;
    issue.issueNumber = 36;
    issueFindOneMock.mockResolvedValue(issue);

    let pull = new Pull();
    pull.id = 35;
    pull.pullNumber = 37;
    pullFindOneMock.mockResolvedValue(pull);

    const ret = await challengePullService.awardWhenPullClosedAndContainClose(
      pullPayload
    );
    expect(ret).toBe(true);
  });

  test("not contains close", async () => {
    expect.assertions(1);
    pullPayload.pull.body = "- Issue Number: #36 ";
    const ret = await challengePullService.awardWhenPullClosedAndContainClose(
      pullPayload
    );
    expect(ret).toBe(false);
  });

  test("Unable to parse correctly issueNumber", async () => {
    expect.assertions(1);
    pullPayload.pull.body = "- Issue Number: #ac ";
    const ret = await challengePullService.awardWhenPullClosedAndContainClose(
      pullPayload
    );
    expect(ret).toBe(false);
  });

  test("Unable to query issue", async () => {
    expect.assertions(1);
    pullPayload.pull.body = "- Issue Number: close #36 ";

    let issue = new Issue();
    // issue.id = 93;
    issue.issueNumber = 36;
    issueFindOneMock.mockResolvedValue(issue);

    let pull = new Pull();
    // pull.id = 35;
    pull.pullNumber = 37;
    pullFindOneMock.mockResolvedValue(pull);
    const ret = await challengePullService.awardWhenPullClosedAndContainClose(
      pullPayload
    );
    expect(ret).toBe(false);
  });

  test("Unable to query currentLeftScore", async () => {
    expect.assertions(1);
    pullPayload.pull.body = "- Issue Number: close #36 ";

    let issue = new Issue();
    issue.id = 93;
    issue.issueNumber = 36;
    issueFindOneMock.mockResolvedValue(issue);

    let pull = new Pull();
    pull.id = 35;
    pull.pullNumber = 37;
    pullFindOneMock.mockResolvedValue(pull);

    scoreFindOneMock.mockResolvedValue(undefined);
    const ret = await challengePullService.awardWhenPullClosedAndContainClose(
      pullPayload
    );
    expect(ret).toBe(false);
  });
});

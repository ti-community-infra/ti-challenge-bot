import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Issue } from "../../db/entities/Issue";

import { Repository } from "typeorm/repository/Repository";

import { IssuePayload } from "../../events/payloads/IssuePayload";

import { FindOneOptions } from "typeorm/find-options/FindOneOptions";

@Service()
export default class IssueService {
  constructor(
    @InjectRepository(Issue)
    private issueRepository: Repository<Issue>
  ) {}

  public async findOne(
    options?: FindOneOptions<Issue>
  ): Promise<Issue | undefined> {
    return await this.issueRepository.findOne(options);
  }

  /**
   * Add issue.
   * @param issuePayload the issue payload come from github.
   */
  public async add(issuePayload: IssuePayload): Promise<Issue> {
    const { issue: issueQuery } = issuePayload;

    const newIssue = new Issue();
    newIssue.owner = issuePayload.owner;
    newIssue.repo = issuePayload.repo;
    newIssue.issueNumber = issueQuery.number;
    newIssue.title = issueQuery.title;
    newIssue.body = issueQuery.body;
    newIssue.user = issueQuery.user?.login;
    // FIXME: we need add relation.
    newIssue.association = issueQuery.authorAssociation;
    newIssue.label = issueQuery.labels
      .map((label) => {
        return label.name;
      })
      .join(",");
    newIssue.status = issueQuery.state;
    newIssue.updatedAt = issueQuery.updatedAt;
    newIssue.closedAt = issueQuery.closedAt;

    return await this.issueRepository.save(newIssue);
  }

  /**
   * Update issue info.
   * @param issuePayload
   */
  public async update(issuePayload: IssuePayload): Promise<Issue | undefined> {
    const issue = await this.findOne({
      where: {
        owner: issuePayload.owner,
        repo: issuePayload.repo,
        issueNumber: issuePayload.issue.number,
      },
    });

    if (issue === undefined) {
      return;
    }

    const { issue: issueQuery } = issuePayload;

    issue.owner = issuePayload.owner;
    issue.repo = issuePayload.repo;
    issue.title = issueQuery.title;
    issue.body = issueQuery.body;
    issue.user = issueQuery.user?.login;
    // FIXME: we need add association and relation.
    issue.label = issueQuery.labels
      .map((label) => {
        return label.name;
      })
      .join(",");
    issue.status = issueQuery.state;
    issue.updatedAt = issueQuery.updatedAt;
    issue.closedAt = issueQuery.closedAt;

    await this.issueRepository.save(issue);

    return issue;
  }

  public async delete(issuePayload: IssuePayload): Promise<Issue | undefined> {
    const issue = await this.findOne({
      where: {
        owner: issuePayload.owner,
        repo: issuePayload.repo,
        issueNumber: issuePayload.issue.number,
      },
    });
    if (issue === undefined) {
      return;
    }
    return await this.issueRepository.remove(issue);
  }
}

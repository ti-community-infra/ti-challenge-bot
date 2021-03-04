import { Entity, OneToOne, PrimaryGeneratedColumn, Column } from "typeorm";
import { ChallengeIssue } from "./ChallengeIssue";
@Entity({ name: "issues" })
export class Issue {
  @PrimaryGeneratedColumn({ name: "id" })
  id: number;

  @Column({ default: null })
  owner: string;

  @Column({ default: null })
  repo: string;

  @Column({ name: "issue_number" })
  issueNumber: number;

  @Column({ type: "text" })
  title: string;

  @Column({ type: "text" })
  body?: string;

  @Column({ default: null })
  user?: string;

  @Column({ default: null })
  association: string;

  @Column({ default: null })
  relation: string;

  @Column({ type: "text" })
  label: string;

  @Column({ type: "varchar", length: 128 })
  status: string;

  // FIXME: maybe this means issue created time.
  @Column({
    name: "created_at",
    type: "timestamp",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: string;

  @Column({
    name: "updated_at",
    type: "timestamp",
    nullable: true,
    default: null,
  })
  updatedAt: string;

  @Column({
    name: "closed_at",
    type: "timestamp",
    nullable: true,
    default: null,
  })
  closedAt: string | null;

  // @ts-ignore
  @OneToOne(() => ChallengeIssue, (challengeIssue) => challengeIssue.issue)
  challengeIssue: ChallengeIssue;
}

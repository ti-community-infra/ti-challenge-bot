// @ts-ignore
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { ChallengeIssue } from "./ChallengeIssue";
import { ChallengeTeam } from "./ChallengeTeam";

export enum ChallengeProgramType {
  ONLY_TEAM = "ONLY_TEAM",

  ONLY_INDIVIDUAL = "ONLY_INDIVIDUAL",

  ALL = "ALL",
}

@Entity({ name: "challenge_programs" })
export class ChallengeProgram {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "program_theme", unique: true, nullable: false })
  programTheme: string;

  @Column({ name: "program_name", nullable: true, default: null })
  programName: string;

  @Column({ name: "program_desc", nullable: true, default: null })
  programDesc: string;

  @Column({
    name: "begin_at",
    type: "timestamp",
    nullable: true,
    default: null,
  })
  beginAt: Date;

  @Column({ name: "end_at", type: "timestamp", nullable: true, default: null })
  endAt: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @Column({ name: "type", nullable: false, default: ChallengeProgramType.ALL })
  type: string;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToMany(
    // @ts-ignore
    (type) => ChallengeIssue,
    (challengeIssue) => challengeIssue.challengeProgram
  )
  challengeIssues: ChallengeIssue[];

  @OneToMany(
    // @ts-ignore
    (type) => ChallengeTeam,
    (challengeTeam) => challengeTeam.challengeProgram
  )
  challengeTeams: ChallengeTeam[];
}

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ChallengeProgram } from "./ChallengeProgram";

@Entity({ name: "challenge_teams" })
export class ChallengeTeam {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "team_name", nullable: false })
  teamName: string;

  @Column({ name: "team_desc", type: "text", nullable: true, default: null })
  teamDesc?: string | null;

  @Column({ name: "challenge_program_id", nullable: false })
  challengeProgramId: number;

  @Column({
    name: "leader_github_id",
    type: "varchar",
    nullable: true,
    default: null,
  })
  leaderGithubId?: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // @ts-ignore
  @ManyToOne((type) => ChallengeProgram, (program) => program.challengeTeams)
  @JoinColumn({ name: "challenge_program_id", referencedColumnName: "id" })
  challengeProgram: ChallengeProgram;
}

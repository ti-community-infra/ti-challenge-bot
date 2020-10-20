import {
  Entity,
  JoinColumn,
  PrimaryGeneratedColumn,
  Unique,
  Column,
  ManyToOne,
} from "typeorm";
import { Sig } from "./Sig";
// FIXME: it should be sig_projects.
@Entity({ name: "project_sig" })
@Unique(["sigId", "repo"])
export class ProjectSig {
  // FIXME: it should be id.
  @PrimaryGeneratedColumn({ name: "project_sig_id" })
  projectSigId: number;

  @Column({ name: "sig_id", nullable: true })
  sigId: number;

  @Column({ nullable: true, default: null })
  repo: string;

  @Column({ name: "project_url", nullable: false, unique: true })
  projectUrl: string;

  // FIXME: we should rename it and use timestamp.
  @Column({
    name: "create_time",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
  })
  createTime: Date;

  // @ts-ignore
  @ManyToOne((type) => Sig, (sig) => sig.projects)
  @JoinColumn({ name: "sig_id", referencedColumnName: "id" })
  sig: Sig;
}

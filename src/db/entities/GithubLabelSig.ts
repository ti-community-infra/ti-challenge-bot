import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";

// FIXME: maybe it should be SigGithubLabel.
@Entity({ name: "github_label_sig" })
@Unique(["repo", "label"])
export class GithubLabelSig {
  @PrimaryGeneratedColumn({ name: "id" })
  id: number;

  @Column({ nullable: true, default: null })
  repo: string;

  @Column({ nullable: true, default: null })
  label: string;

  @Column({ nullable: true, default: null })
  info: string;

  // FIXME: maybe we should store the sig id, not sig project id.
  @Column({ name: "project_sig_id", nullable: true, default: null })
  projectSigId: number;
}

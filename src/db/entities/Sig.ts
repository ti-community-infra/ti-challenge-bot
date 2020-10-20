import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ProjectSig } from "./ProjectSig";
// FIXME: it should be sigs.
@Entity({ name: "sig" })
export class Sig {
  @PrimaryGeneratedColumn({ name: "id" })
  id: number;

  @Column({ nullable: true, default: null, unique: true })
  name: string;

  @Column({ nullable: true, default: null })
  info: string;

  @Column({ name: "sig_url", nullable: true, default: null })
  sigUrl: string;

  // FIXME: we should rename it and use timestamp.
  @Column({
    name: "create_time",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
  })
  createTime: Date;

  @Column({ nullable: true, default: null })
  channel: string;

  // FIXME: we should rename it and use timestamp.
  @Column({
    name: "update_time",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
  })
  updateTime: Date;

  @Column({ nullable: false, default: 0 })
  status: number;

  @Column({ nullable: true, default: 2 })
  lgtm: number;

  // @ts-ignore
  @OneToMany((type) => ProjectSig, (project) => project.sig)
  projects: ProjectSig[];
}

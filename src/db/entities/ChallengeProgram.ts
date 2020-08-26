// @ts-ignore
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'challenge_programs' })
export class ChallengeProgram {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'program_theme', unique: true, nullable: false })
    programTheme: string;

    @Column({ name: 'program_name', nullable: true, default: null })
    programName: string;

    @Column({ name: 'program_desc', nullable: true, default: null })
    programDesc: string;

    @Column({ name: 'begin_at', type: 'timestamp', nullable: true, default: null })
    beginAt: Date;

    @Column({ name: 'end_at', type: 'timestamp', nullable: true, default: null })
    endAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'update_at' })
    updatedAt: Date;
}

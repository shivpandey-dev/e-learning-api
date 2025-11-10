import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { CourseSection } from './courseSection.entity';
import { VideoProvider } from '../enums/VideoProvider.enum';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  slug: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  subtitle?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  price: string; // store as string to avoid JS float issues

  @Column({ default: false })
  isPublished: boolean;

  @Column({ type: 'enum', enum: VideoProvider, nullable: true })
  videoProvider: VideoProvider | null;

  // TPStreams folder UUID where this course’s videos will live
  @Column({ type: 'varchar', nullable: true })
  providerFolderId: string | null;

  // who created/owns this course (teacher)
  @ManyToOne(() => User, { nullable: false })
  teacher: User;

  // optional: course tied to a branch (or global if null)
  @ManyToOne(() => Branch, { nullable: true })
  branch?: Branch | null;

  @OneToMany(() => CourseSection, (s) => s.course, { cascade: true })
  sections: CourseSection[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

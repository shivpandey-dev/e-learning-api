import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CourseSection } from './courseSection.entity';
import { LessonType } from '../enums/LessonType.enum';
import { VideoProvider } from '../enums/VideoProvider.enum';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  // order of lesson inside a section (0,1,2…)
  @Column({ type: 'int', default: 0 })
  orderIndex: number;

  @Column({ type: 'enum', enum: LessonType })
  type: LessonType;

  // TEXT lesson content
  @Column({ type: 'text', nullable: true })
  textContent?: string;

  // VIDEO lesson fields
  @Column({ type: 'enum', enum: VideoProvider, nullable: true })
  videoProvider?: VideoProvider;

  // e.g., Vimeo video id / TPStreams asset id / YouTube id
  @Column({ nullable: true })
  videoRefId?: string;

  // optional metadata
  @Column({ type: 'int', nullable: true })
  durationSeconds?: number;

  @ManyToOne(() => CourseSection, (s) => s.lessons, { onDelete: 'CASCADE' })
  section: CourseSection;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

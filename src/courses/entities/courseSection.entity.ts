import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { Lesson } from './lesson.entity';

@Entity('course_sections')
export class CourseSection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  // order of section in the course (0,1,2…)
  @Column({ type: 'int', default: 0 })
  orderIndex: number;

  @ManyToOne(() => Course, (c) => c.sections, { onDelete: 'CASCADE' })
  course: Course;

  @OneToMany(() => Lesson, (l) => l.section, { cascade: true })
  lessons: Lesson[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

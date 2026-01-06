import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LessonMediaStatus } from '../enums/LessonMediaStatus.enum';

@Entity({ name: 'lesson_media' })
export class LessonMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Foreign key to your Lesson entity.
   * Abhi hum sirf lessonId as string store kar rahe hain,
   * later you can convert this to a proper relation if needed.
   */
  @Column({ type: 'uuid' })
  lessonId: string;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  /**
   * Postgres BIGINT is represented as string in JS,
   * isliye yahan type string rakha hai.
   */
  @Column({ type: 'bigint' })
  fileSize: string;

  @Column({ type: 'varchar', length: 100 })
  mimeType: string;

  /**
   * e.g. 'TPSTREAMS', future mein 'VIMEO' / 'YOUTUBE' bhi aa sakte hain.
   */
  @Column({ type: 'varchar', length: 50 })
  provider: string;

  /**
   * Optional: TPStreams folder ID for course (if you use folders per course).
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  providerFolderId: string | null;

  /**
   * TPStreams file / asset ID.
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  providerFileId: string | null;

  /**
   * Upload session ID from TPStreams (if they provide one).
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  providerUploadId: string | null;

  @Column({
    type: 'enum',
    enum: LessonMediaStatus,
    default: LessonMediaStatus.PENDING,
  })
  status: LessonMediaStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

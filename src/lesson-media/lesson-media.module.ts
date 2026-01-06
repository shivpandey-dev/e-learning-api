import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LessonMedia } from './entities/lessonMedia.entity';
import { LessonMediaService } from './lesson-media.service';
import { LessonMediaController } from './lesson-media.controller';

import { CoursesModule } from '../courses/courses.module';
import { TpstreamsModule } from '../integrations/tpstreams/tpstreams.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LessonMedia]),
    CoursesModule,
    TpstreamsModule,
  ],
  controllers: [LessonMediaController],
  providers: [LessonMediaService],
  exports: [LessonMediaService],
})
export class LessonMediaModule {}

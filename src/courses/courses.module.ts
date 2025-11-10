import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CourseSection } from './entities/courseSection.entity';
import { Lesson } from './entities/lesson.entity';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { User } from 'src/users/user.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { TpstreamsModule } from 'src/integrations/tpstreams/tpstreams.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, CourseSection, Lesson, User, Branch]),
    TpstreamsModule,
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [TypeOrmModule, CoursesService],
})
export class CoursesModule {}

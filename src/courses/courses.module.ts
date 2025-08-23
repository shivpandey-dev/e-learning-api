import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CourseSection } from './entities/courseSection.entity';
import { Lesson } from './entities/lesson.entity';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { User } from 'src/users/user.entity';
import { Branch } from 'src/branch/entities/branch.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, CourseSection, Lesson, User, Branch]),
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [TypeOrmModule],
})
export class CoursesModule {}

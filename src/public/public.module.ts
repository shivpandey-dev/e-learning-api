import { Module } from '@nestjs/common';
import { CoursesModule } from 'src/courses/courses.module';
import { PublicController } from 'src/public/public.controller';

@Module({
  imports: [CoursesModule], // reuse service & entities
  controllers: [PublicController],
})
export class PublicModule {}

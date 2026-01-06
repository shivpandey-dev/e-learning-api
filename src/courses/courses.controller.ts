import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { UpdateCoursePublishStatusDto } from './dto/update-course-publish-status.dto';
import { ReorderSectionsDto } from './dto/reorder-sections.dto';
import { ReorderLessonsDto } from './dto/reorder-lessons.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Request } from 'express';
import { PaginatedCourseQueryDto } from './dto/paginated-course-query.dto';

// Strongly-typed request with authenticated user
type RequestWithUser = Request & {
  user: {
    userId: string;
    role: string;
  };
};

@Auth('admin', 'teacher') // everything here requires teacher/admin
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  createCourse(@Body() dto: CreateCourseDto, @Req() req: RequestWithUser) {
    return this.coursesService.createCourse(dto, req.user);
  }

  @Get()
  getCourses(
    @Query() query: PaginatedCourseQueryDto,
    @Req() req: RequestWithUser,
  ) {
    const route = `${req.protocol}://${req.get('host')}${req.baseUrl}`;

    // Normalize ParsedQs -> Record<string, string | string[]>
    const safeString = (val: unknown): string => {
      if (val === null || val === undefined) return '';
      if (typeof val === 'string') return val;
      if (typeof val === 'number' || typeof val === 'boolean')
        return String(val);
      // Arrays or objects -> JSON
      try {
        return JSON.stringify(val);
      } catch {
        return '';
      }
    };

    const plainQuery: Record<string, string | string[]> = {};
    for (const [key, val] of Object.entries(req.query)) {
      if (val === undefined || val === null) continue;

      if (Array.isArray(val)) {
        plainQuery[key] = val.map((item) => safeString(item));
      } else {
        plainQuery[key] = safeString(val);
      }
    }

    return this.coursesService.listCourses(query, route, plainQuery);
  }

  @Get(':id')
  getCourse(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.findCourseById(id);
  }

  @Get('slug/:slug')
  getCourseBySlug(@Param('slug') slug: string) {
    return this.coursesService.findCourseBySlug(slug);
  }

  @Patch(':id')
  updateCourse(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCourseDto,
    @Req() req: RequestWithUser,
  ) {
    return this.coursesService.updateCourse(id, dto, req.user);
  }

  // sections
  @Post('sections')
  addSection(@Body() dto: CreateSectionDto, @Req() req: RequestWithUser) {
    return this.coursesService.addSection(dto, req.user);
  }

  @Patch('sections/:id')
  updateSection(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSectionDto,
    @Req() req: RequestWithUser,
  ) {
    return this.coursesService.updateSection(id, dto, req.user);
  }

  @Delete('sections/:id')
  deleteSection(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithUser,
  ) {
    return this.coursesService.deleteSection(id, req.user);
  }

  @Patch(':id/publish')
  setCoursePublishStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCoursePublishStatusDto,
    @Req() req: RequestWithUser,
  ) {
    return this.coursesService.setCoursePublishStatus(
      id,
      dto.isPublished,
      req.user,
    );
  }

  @Patch('sections/reorder')
  reorderSections(
    @Body() dto: ReorderSectionsDto,
    @Req() req: RequestWithUser,
  ) {
    return this.coursesService.reorderSections(dto, req.user);
  }

  // lessons
  @Post('lessons')
  addLesson(@Body() dto: CreateLessonDto, @Req() req: RequestWithUser) {
    return this.coursesService.addLesson(dto, req.user);
  }

  @Patch('lessons/:id')
  updateLesson(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLessonDto,
    @Req() req: RequestWithUser,
  ) {
    return this.coursesService.updateLesson(id, dto, req.user);
  }

  @Delete('lessons/:id')
  deleteLesson(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithUser,
  ) {
    return this.coursesService.deleteLesson(id, req.user);
  }

  @Patch('lessons/reorder')
  reorderLessons(@Body() dto: ReorderLessonsDto, @Req() req: RequestWithUser) {
    return this.coursesService.reorderLessons(dto, req.user);
  }
}

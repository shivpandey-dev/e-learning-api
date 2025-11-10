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
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Request } from 'express';
import { Query } from '@nestjs/common';
import { PaginatedCourseQueryDto } from './dto/paginated-course-query.dto';

@Auth('admin', 'teacher') // everything here requires teacher/admin
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  createCourse(@Body() dto: CreateCourseDto, @Req() req: Request) {
    return this.coursesService.createCourse(dto, req.user as any);
  }

  @Get()
  getCourses(@Query() query: PaginatedCourseQueryDto, @Req() req: Request) {
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
    @Req() req: Request,
  ) {
    return this.coursesService.updateCourse(id, dto, req.user as any);
  }

  // sections
  @Post('sections')
  addSection(@Body() dto: CreateSectionDto, @Req() req: Request) {
    return this.coursesService.addSection(dto, req.user as any);
  }

  @Patch('sections/:id')
  updateSection(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSectionDto,
    @Req() req: Request,
  ) {
    return this.coursesService.updateSection(id, dto, req.user as any);
  }

  @Delete('sections/:id')
  deleteSection(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.coursesService.deleteSection(id, req.user as any);
  }

  // lessons
  @Post('lessons')
  addLesson(@Body() dto: CreateLessonDto, @Req() req: Request) {
    return this.coursesService.addLesson(dto, req.user as any);
  }

  @Patch('lessons/:id')
  updateLesson(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLessonDto,
    @Req() req: Request,
  ) {
    return this.coursesService.updateLesson(id, dto, req.user as any);
  }

  @Delete('lessons/:id')
  deleteLesson(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.coursesService.deleteLesson(id, req.user as any);
  }
}

import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { CoursesService } from 'src/courses/courses.service';
import { BranchService } from 'src/branch/branch.service';
import { PaginatedCourseQueryDto } from 'src/courses/dto/paginated-course-query.dto';
import { Request } from 'express';
import { PaginatedBranchQueryDto } from 'src/branch/dto/paginatedBranchQuery.dto';

type QParams = Record<string, string | string[]>;

@Controller('public')
export class PublicController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly branchService: BranchService,
  ) {}

  // ---------------- COURSES ----------------
  @Get('courses')
  async listCourses(
    @Query() query: PaginatedCourseQueryDto,
    @Req() req: Request<Record<string, any>, any, any, QParams>,
  ) {
    const route = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
    return this.coursesService.listCourses(
      { ...query, includeDrafts: 'false' }, // force only published
      route,
      req.query,
    );
  }

  @Get('courses/slug/:slug')
  async courseBySlug(@Param('slug') slug: string) {
    return this.coursesService.findCourseBySlug(slug, false);
  }

  // ---------------- BRANCHES ----------------
  @Get('branches')
  async listBranches(
    @Query() query: PaginatedBranchQueryDto,
    @Req() req: Request,
  ) {
    const route = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
    const queryParams = req.query as unknown as Record<
      string,
      string | string[]
    >;
    return this.branchService.findAll(query, route, queryParams); // your BranchService’s read method
  }

  @Get('branches/:id')
  async branchById(@Param('id') id: string) {
    return this.branchService.findOne(id);
  }

  // ---------------- FUTURE EXTENSIONS ----------------
  // /public/users/teachers
  // /public/cities
}

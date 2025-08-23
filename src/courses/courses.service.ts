import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CourseSection } from './entities/courseSection.entity';
import { Lesson } from './entities/lesson.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { PaginatedCourseQueryDto } from './dto/paginated-course-query.dto';
import { paginate } from 'src/common/utils/paginate';
import { User } from 'src/users/user.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { normalizeSortOrder } from 'src/common/utils/sortOrder';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
    @InjectRepository(CourseSection)
    private readonly sectionRepo: Repository<CourseSection>,
    @InjectRepository(Lesson) private readonly lessonRepo: Repository<Lesson>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Branch) private readonly branchRepo: Repository<Branch>,
  ) {}

  // --- helpers ---
  private toSlug(input: string): string {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  // --- courses ---
  async createCourse(
    dto: CreateCourseDto,
    currentUser: { userId: string; role: string },
  ) {
    // teacher is current user unless teacherId specified (admin can set)
    let teacher = await this.userRepo.findOne({
      where: { id: currentUser.userId },
    });
    if (dto.teacherId) {
      const t = await this.userRepo.findOne({ where: { id: dto.teacherId } });
      if (!t) throw new NotFoundException('Teacher not found');
      teacher = t;
    }
    if (!teacher) throw new NotFoundException('Teacher not found');

    const course = this.courseRepo.create({
      title: dto.title,
      subtitle: dto.subtitle,
      description: dto.description,
      price: dto.price ?? '0.00',
      isPublished: !!dto.isPublished,
      slug: dto.slug ?? this.toSlug(dto.title),
      teacher,
    });

    if (dto.branchId) {
      const branch = await this.branchRepo.findOne({
        where: { id: dto.branchId },
      });
      if (!branch) throw new NotFoundException('Branch not found');
      course.branch = branch;
    }

    return this.courseRepo.save(course);
  }

  async updateCourse(
    id: string,
    dto: UpdateCourseDto,
    currentUser: { userId: string; role: string },
  ) {
    const course = await this.courseRepo.findOne({
      where: { id },
      relations: ['teacher', 'branch'],
    });
    if (!course) throw new NotFoundException('Course not found');

    // Only admin or the course's teacher can update
    if (
      currentUser.role !== 'admin' &&
      course.teacher?.id !== currentUser.userId
    ) {
      throw new ForbiddenException('You cannot update this course');
    }

    if (dto.title) {
      course.title = dto.title;
      if (!dto.slug) {
        course.slug = this.toSlug(dto.title);
      }
    }
    if (dto.slug) course.slug = dto.slug;
    if (dto.subtitle !== undefined) course.subtitle = dto.subtitle;
    if (dto.description !== undefined) course.description = dto.description;
    if (dto.price !== undefined) course.price = dto.price;
    if (dto.isPublished !== undefined) course.isPublished = dto.isPublished;

    if (dto.branchId !== undefined) {
      if (dto.branchId === (null as any)) {
        course.branch = null;
      } else {
        const branch = await this.branchRepo.findOne({
          where: { id: dto.branchId },
        });
        if (!branch) throw new NotFoundException('Branch not found');
        course.branch = branch;
      }
    }

    return this.courseRepo.save(course);
  }

  async findCourseById(id: string) {
    const course = await this.courseRepo.findOne({
      where: { id },
      relations: ['teacher', 'branch', 'sections', 'sections.lessons'],
      order: { sections: { orderIndex: 'ASC' } },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async findCourseBySlug(slug: string, includeDrafts = false) {
    const course = await this.courseRepo.findOne({
      where: includeDrafts ? { slug } : { slug, isPublished: true },
      relations: ['teacher', 'branch', 'sections', 'sections.lessons'],
      order: { sections: { orderIndex: 'ASC' } },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async listCourses(
    query: PaginatedCourseQueryDto,
    route: string,
    queryParams: Record<string, string | string[]>,
  ) {
    const qb = this.courseRepo
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.teacher', 'teacher')
      .leftJoinAndSelect('course.branch', 'branch');

    // search on title, subtitle
    if (query.search) {
      qb.andWhere('(course.title ILIKE :s OR course.subtitle ILIKE :s)', {
        s: `%${query.search}%`,
      });
    }

    if (query.teacherId)
      qb.andWhere('teacher.id = :tid', { tid: query.teacherId });
    if (query.branchId)
      qb.andWhere('branch.id = :bid', { bid: query.branchId });

    // public by default: only published
    if (!query.includeDrafts || query.includeDrafts === 'false') {
      qb.andWhere('course.isPublished = true');
    }

    return paginate(qb, {
      page: parseInt(query.page || '1'),
      limit: parseInt(query.limit || '10'),
      searchTerm: undefined,
      searchableColumns: [],
      filters: {},
      sortBy: query.sortBy ?? 'createdAt',
      order: normalizeSortOrder(query.order),
      route,
      queryParams,
    });
  }

  // --- sections ---
  async addSection(
    dto: CreateSectionDto,
    currentUser: { userId: string; role: string },
  ) {
    const course = await this.courseRepo.findOne({
      where: { id: dto.courseId },
      relations: ['teacher'],
    });
    if (!course) throw new NotFoundException('Course not found');

    if (
      currentUser.role !== 'admin' &&
      course.teacher?.id !== currentUser.userId
    ) {
      throw new ForbiddenException(
        'You cannot modify sections for this course',
      );
    }

    const section = this.sectionRepo.create({
      title: dto.title,
      orderIndex: dto.orderIndex ?? 0,
      course,
    });
    return this.sectionRepo.save(section);
  }

  async updateSection(
    id: string,
    dto: UpdateSectionDto,
    currentUser: { userId: string; role: string },
  ) {
    const section = await this.sectionRepo.findOne({
      where: { id },
      relations: ['course', 'course.teacher'],
    });
    if (!section) throw new NotFoundException('Section not found');

    if (
      currentUser.role !== 'admin' &&
      section.course.teacher?.id !== currentUser.userId
    ) {
      throw new ForbiddenException('You cannot update this section');
    }

    if (dto.title !== undefined) section.title = dto.title;
    if (dto.orderIndex !== undefined) section.orderIndex = dto.orderIndex;

    return this.sectionRepo.save(section);
  }

  async deleteSection(
    id: string,
    currentUser: { userId: string; role: string },
  ) {
    const section = await this.sectionRepo.findOne({
      where: { id },
      relations: ['course', 'course.teacher'],
    });
    if (!section) throw new NotFoundException('Section not found');

    if (
      currentUser.role !== 'admin' &&
      section.course.teacher?.id !== currentUser.userId
    ) {
      throw new ForbiddenException('You cannot delete this section');
    }
    await this.sectionRepo.remove(section);
    return { success: true };
  }

  // --- lessons ---
  async addLesson(
    dto: CreateLessonDto,
    currentUser: { userId: string; role: string },
  ) {
    const section = await this.sectionRepo.findOne({
      where: { id: dto.sectionId },
      relations: ['course', 'course.teacher'],
    });
    if (!section) throw new NotFoundException('Section not found');

    if (
      currentUser.role !== 'admin' &&
      section.course.teacher?.id !== currentUser.userId
    ) {
      throw new ForbiddenException('You cannot add lessons to this section');
    }

    const lesson = this.lessonRepo.create({
      title: dto.title,
      orderIndex: dto.orderIndex ?? 0,
      type: dto.type,
      textContent: dto.textContent,
      videoProvider: dto.videoProvider,
      videoRefId: dto.videoRefId,
      durationSeconds: dto.durationSeconds,
      section,
    });

    return this.lessonRepo.save(lesson);
  }

  async updateLesson(
    id: string,
    dto: UpdateLessonDto,
    currentUser: { userId: string; role: string },
  ) {
    const lesson = await this.lessonRepo.findOne({
      where: { id },
      relations: ['section', 'section.course', 'section.course.teacher'],
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    if (
      currentUser.role !== 'admin' &&
      lesson.section.course.teacher?.id !== currentUser.userId
    ) {
      throw new ForbiddenException('You cannot update this lesson');
    }

    if (dto.title !== undefined) lesson.title = dto.title;
    if (dto.orderIndex !== undefined) lesson.orderIndex = dto.orderIndex;
    if (dto.type !== undefined) lesson.type = dto.type;
    if (dto.textContent !== undefined) lesson.textContent = dto.textContent;
    if (dto.videoProvider !== undefined)
      lesson.videoProvider = dto.videoProvider;
    if (dto.videoRefId !== undefined) lesson.videoRefId = dto.videoRefId;
    if (dto.durationSeconds !== undefined)
      lesson.durationSeconds = dto.durationSeconds;

    return this.lessonRepo.save(lesson);
  }

  async deleteLesson(
    id: string,
    currentUser: { userId: string; role: string },
  ) {
    const lesson = await this.lessonRepo.findOne({
      where: { id },
      relations: ['section', 'section.course', 'section.course.teacher'],
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    if (
      currentUser.role !== 'admin' &&
      lesson.section.course.teacher?.id !== currentUser.userId
    ) {
      throw new ForbiddenException('You cannot delete this lesson');
    }
    await this.lessonRepo.remove(lesson);
    return { success: true };
  }
}

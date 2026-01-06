import {
  BadRequestException,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';

import { CoursesService } from '../courses/courses.service';
import { TpstreamsService } from '../integrations/tpstreams/tpstreams.service';
import { VideoProvider } from '../courses/enums/VideoProvider.enum';

@Controller('lessons')
export class LessonMediaController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly tpstreamsService: TpstreamsService,
  ) {}

  /**
   * Returns TPStreams auth token for initializing the TPStreams JS Uploader SDK.
   * Token is cached/reused by TpstreamsClient to avoid exceeding org token limits.
   */
  @Post(':lessonId/media/tpstreams/auth-token')
  async getTpstreamsAuthToken(
    @Param('lessonId', new ParseUUIDPipe()) lessonId: string,
  ): Promise<{ authToken: string; orgId: string; providerFolderId: string }> {
    const lesson = await this.coursesService.findLessonWithCourseById(lessonId);

    const course = lesson.section?.course;
    if (!course) {
      throw new BadRequestException('Course not found for this lesson');
    }

    if (course.videoProvider !== VideoProvider.TPSTREAMS) {
      throw new BadRequestException(
        `Course video provider is not TPSTREAMS. Current: ${course.videoProvider}`,
      );
    }

    if (!course.providerFolderId) {
      throw new BadRequestException(
        'TPStreams folder is not configured for this course',
      );
    }

    const { token, orgId } =
      await this.tpstreamsService.getAuthTokenForUploader();

    return {
      authToken: token, // FE will use as authToken in JS SDK
      orgId,
      providerFolderId: course.providerFolderId,
    };
  }
}

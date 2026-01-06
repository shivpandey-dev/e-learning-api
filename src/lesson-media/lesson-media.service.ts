import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LessonMedia } from './entities/lessonMedia.entity';
import { LessonMediaStatus } from './enums/LessonMediaStatus.enum';

@Injectable()
export class LessonMediaService {
  constructor(
    @InjectRepository(LessonMedia)
    private readonly lessonMediaRepo: Repository<LessonMedia>,
  ) {}

  /**
   * Keep a small helper that is generally useful and does not depend on TPStreams.
   */
  async updateStatusByProviderFileId(
    providerFileId: string,
    status: LessonMediaStatus,
  ): Promise<LessonMedia | null> {
    const media = await this.lessonMediaRepo.findOne({
      where: { providerFileId },
    });

    if (!media) return null;

    media.status = status;
    return this.lessonMediaRepo.save(media);
  }
}

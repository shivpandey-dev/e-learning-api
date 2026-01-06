import { Test, TestingModule } from '@nestjs/testing';
import { LessonMediaService } from './lesson-media.service';

describe('LessonMediaService', () => {
  let service: LessonMediaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LessonMediaService],
    }).compile();

    service = module.get<LessonMediaService>(LessonMediaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

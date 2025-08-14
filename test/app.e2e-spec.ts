import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    const environment = process.env.NODE_ENV || 'development';
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect({
        message: `Welcome to the E-Learning Platform API! - ${environment.toUpperCase()} Server`,
        status: 'OK',
        version: 'v1.0',
        docs: '/api-docs',
      });
  });
});

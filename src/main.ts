import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const env = process.env.NODE_ENV || 'development';
  let prefix = 'api/dev';
  if (env === 'production') prefix = 'api/prod';
  else if (env === 'staging') prefix = 'api/stage';
  app.setGlobalPrefix(prefix);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(Number(process.env.PORT) || 4300);
}
void bootstrap();

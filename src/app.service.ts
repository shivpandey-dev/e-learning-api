import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): any {
    return {
      message: 'Welcome to the E-Learning Platform API!',
      status: 'OK',
      version: 'v1.0',
      docs: '/api-docs',
    };
  }
}

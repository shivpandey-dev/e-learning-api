import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): any {
    const environment = process.env.NODE_ENV || 'development';
    return {
      message: `Welcome to the E-Learning Platform API! - ${environment.toUpperCase()} Server`,
      status: 'OK',
      version: 'v1.0',
      docs: '/api-docs',
    };
  }
}

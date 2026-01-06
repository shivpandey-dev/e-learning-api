import { Injectable } from '@nestjs/common';

export interface HelloResponse {
  message: string;
  status: string;
  version: string;
  docs: string;
}

@Injectable()
export class AppService {
  getHello(): HelloResponse {
    const environment = process.env.NODE_ENV || 'development';

    return {
      message: `Welcome to the E-Learning Platform API! - ${environment.toUpperCase()} Server`,
      status: 'OK',
      version: 'v1.0',
      docs: '/api-docs',
    };
  }
}

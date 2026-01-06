import { Controller, Get } from '@nestjs/common';
import { AppService, HelloResponse } from './app.service';

@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  home(): HelloResponse {
    return this.appService.getHello();
  }
}

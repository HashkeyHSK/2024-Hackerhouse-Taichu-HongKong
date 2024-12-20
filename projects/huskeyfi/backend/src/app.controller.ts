import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('webhook')
  getWebhook(): string {
    console.log('received webhook');
    return 'test';
  }

  @Post('webhook')
  postWebhook(@Body() body: any): string {
    console.log('received webhook', body);
    return 'test';
  }
}

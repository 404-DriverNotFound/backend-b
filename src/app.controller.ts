import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Default')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: '서버의 실행 상태를 확인합니다.' })
  @ApiResponse({ status: 200, description: '서버가 실행 중' })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

import { Controller, Get, UseFilters, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { AuthenticatedRedirectExceptionFilter } from './auth/filters/authenticated-redirect-exception.filter';
import { AuthenticatedGuard } from './auth/guards/authenticated.guard';

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

  @ApiCookieAuth()
  @ApiOperation({ summary: '세션인증 결과를 알려줍니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 403, description: '세션 인증 실패' })
  @Get('session')
  @UseGuards(AuthenticatedGuard)
  @UseFilters(AuthenticatedRedirectExceptionFilter)
  hasSession(): void {
    return;
  }
}

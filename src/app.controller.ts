import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { AuthenticatedGuard } from './auth/guards/authenticated.guard';
import { SecondFactorAuthenticatedGuard } from './auth/guards/second-factor-authenticated.guard';
import { GetUser } from './users/get-user.decorator';
import { User } from './users/user.entity';

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

  @ApiOperation({ summary: '데이터베이스 seed를 추가합니다.' })
  @Get('seed')
  @UseGuards(AuthenticatedGuard)
  @UseGuards(SecondFactorAuthenticatedGuard)
  seed(@GetUser() user: User) {
    return this.appService.seed(user);
  }
}

import { Controller, Get, Redirect, Req, UseGuards } from '@nestjs/common';
import {
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from 'src/users/get-user.decorator';
import { User } from 'src/users/user.entity';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { FtGuard } from './guards/ft.guard';
import { Request } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  @ApiOperation({ summary: '42 OAuth로 로그인합니다(세션 등록).' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 500, description: '실패' })
  @Get('42')
  @UseGuards(FtGuard)
  async ftAuth(): Promise<void> {
    return;
  }

  @ApiExcludeEndpoint()
  @Get('42/callback')
  @UseGuards(FtGuard)
  @Redirect(process.env.FRONTEND_URL) // NOTE config 모듈을 사용하고 싶은데 데코레이터라서 그런지 사용이 안됨.
  async ftAuthCallback(@GetUser() user: User): Promise<User> {
    return user;
  }

  @ApiExcludeEndpoint()
  @Get('42/test')
  @UseGuards(AuthenticatedGuard)
  async test(@GetUser() user: User): Promise<User> {
    return user;
  }

  @ApiOperation({ summary: '로그아웃합니다(세션 종료).' })
  @ApiResponse({ status: 200, description: '성공' })
  @Get('logout')
  @UseGuards(AuthenticatedGuard)
  @Redirect(process.env.FRONTEND_URL) // NOTE config 모듈을 사용하고 싶은데 데코레이터라서 그런지 사용이 안됨.
  async logOut(@Req() req: Request): Promise<void> {
    req.logOut();
    return;
  }
}

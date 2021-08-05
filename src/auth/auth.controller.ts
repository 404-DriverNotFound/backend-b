import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
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
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly configService: ConfigService) {}
  @ApiOperation({ summary: '42 OAuth로 로그인합니다(세션 등록).' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 500, description: '실패' })
  @Get('42')
  @UseGuards(FtGuard)
  ftAuth(): Promise<void> {
    return;
  }

  @ApiExcludeEndpoint()
  @Get('42/callback')
  @UseGuards(FtGuard)
  ftAuthCallback(@Res() res: Response): Promise<void> {
    res.redirect(this.configService.get<string>('ORIGIN')); // REVIEW 환경변수를 사용하지 못하는 문제 때문에 Res 사용
    return;
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
  logOut(@Req() req: Request, @Res() res: Response): Promise<void> {
    req.logOut();
    res.redirect(this.configService.get<string>('ORIGIN')); // REVIEW 환경변수를 사용하지 못하는 문제 때문에 Res 사용
    return;
  }
}

import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
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
import { NameGuard } from './guards/name.guard';
import { toFileStream } from 'qrcode';
import { OtpDto } from './dto/otp.dto';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

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
  ftAuthCallback(@GetUser() user: User, @Res() res: Response): Promise<void> {
    const redirectUrl: string = this.authService.redirectUrl(user);
    res.redirect(this.configService.get<string>('ORIGIN') + redirectUrl); // REVIEW 환경변수를 사용하지 못하는 문제 때문에 Res 사용
    return;
  }

  @ApiExcludeEndpoint()
  @Get('42/test')
  @UseGuards(AuthenticatedGuard)
  async test(@GetUser() user: User): Promise<User> {
    return user;
  }

  @ApiOperation({ summary: 'OTP 인증을 합니다.' })
  @ApiResponse({ status: 201, description: '인증 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @Post('otp')
  @UseGuards(NameGuard)
  @UseGuards(AuthenticatedGuard)
  otpAuth(@GetUser() user: User, @Body() otpDto: OtpDto): Promise<User> {
    return this.authService.otpAuth(user, otpDto);
  }

  @ApiOperation({ summary: '나의 OTP QR코드를 가져옵니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @Get('otp/qrcode')
  @UseGuards(NameGuard)
  @UseGuards(AuthenticatedGuard)
  async qrCode(@GetUser() user: User, @Res() res: Response): Promise<any> {
    const otpauth = this.authService.generateKeyUri(user);
    res.setHeader('content-type', 'image/png');
    return toFileStream(res, otpauth);
  }

  @ApiOperation({ summary: '로그아웃합니다(세션 종료).' })
  @ApiResponse({ status: 200, description: '성공' })
  @Get('logout')
  @UseGuards(AuthenticatedGuard)
  logOut(@Req() req: Request): Promise<void> {
    req.logOut();
    return;
  }
}

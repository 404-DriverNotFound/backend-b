import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from 'src/users/get-user.decorator';
import { User } from 'src/users/user.entity';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { FtOauthGuard } from './guards/ft-oauth.guard';
import { Request, Response } from 'express';
import { toFileStream } from 'qrcode';
import { OtpDto } from './dto/otp.dto';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { FtOauthUnauthorizedExceptionFilter } from './filters/ft-oauth-unauthorized-exception.filter';
import { UsersService } from 'src/users/users.service';
import { UserStatus } from 'src/users/user-status.enum';
import { SecondFactorAuthenticatedGuard } from './guards/second-factor-authenticated.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({ summary: '42 OAuth로 로그인합니다(세션 등록).' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 500, description: '실패' })
  @Get('42')
  @UseGuards(FtOauthGuard)
  @UseFilters(FtOauthUnauthorizedExceptionFilter)
  ftAuth(): void {
    return;
  }

  @ApiExcludeEndpoint()
  @Get('42/callback')
  @UseGuards(FtOauthGuard)
  @UseFilters(FtOauthUnauthorizedExceptionFilter)
  async ftAuthCallback(
    @GetUser() user: User,
    @Res() res: Response,
  ): Promise<void> {
    await this.usersService.updateUserStatus(user, UserStatus.ONLINE);
    res.redirect(this.configService.get<string>('ORIGIN'));
    return;
  }

  @ApiExcludeEndpoint()
  @ApiCookieAuth()
  @Get('42/test')
  @UseGuards(AuthenticatedGuard)
  @UseGuards(SecondFactorAuthenticatedGuard)
  async test(@GetUser() user: User): Promise<User> {
    return user;
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'OTP 인증을 합니다.' })
  @ApiResponse({ status: 201, description: '인증 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '금지된 요청' })
  @Post('otp')
  @UseGuards(AuthenticatedGuard)
  otpAuth(@GetUser() user: User, @Body() otpDto: OtpDto): Promise<User> {
    return this.authService.otpAuth(user, otpDto);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: '나의 QR코드를 가져옵니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 403, description: '금지된 요청' })
  @Get('otp/qrcode')
  @UseGuards(AuthenticatedGuard)
  qrCode(@GetUser() user: User, @Res() res: Response): Promise<any> {
    const otpauth = this.authService.generateKeyUri(user);
    res.setHeader('content-type', 'image/png');
    return toFileStream(res, otpauth);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: '로그아웃합니다(세션 종료).' })
  @ApiResponse({ status: 200, description: '성공' })
  @Get('logout')
  @UseGuards(AuthenticatedGuard)
  async logOut(@GetUser() user: User, @Req() req: Request): Promise<void> {
    await this.usersService.updateUserStatus(user, UserStatus.OFFLINE);
    await this.usersService.updateUserIsSecondFactorUnauthenticated(user);
    req.logOut();
    return;
  }
}

import { Controller, Get, UseGuards } from '@nestjs/common';
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

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  @ApiOperation({ summary: '42 OAuth로 로그인합니다.' })
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
  async ftAuthCallback(@GetUser() user: User): Promise<User> {
    return user;
  }

  @ApiExcludeEndpoint()
  @Get('42/test')
  @UseGuards(AuthenticatedGuard)
  async test(@GetUser() user: User): Promise<User> {
    return user;
  }
}

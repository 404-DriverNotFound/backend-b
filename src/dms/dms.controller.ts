import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { SecondFactorAuthenticatedGuard } from 'src/auth/guards/second-factor-authenticated.guard';
import { GetUser } from 'src/users/get-user.decorator';
import { User } from 'src/users/user.entity';
import { Dm } from './dm.entity';
import { DmsService } from './dms.service';
import { CreateDmDto } from './dto/create-dm.dto';

@ApiTags('Dms')
@ApiCookieAuth()
@UseGuards(AuthenticatedGuard)
@UseGuards(SecondFactorAuthenticatedGuard)
@Controller('dms')
export class DmsController {
  constructor(private readonly dmsService: DmsService) {}

  @ApiOperation({ summary: '특정 유저에게 DM을 보냅니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @Post()
  createDm(
    @GetUser() user: User,
    @Body() { name, content }: CreateDmDto,
  ): Promise<Dm> {
    return this.dmsService.createDm(user, name, content);
  }
}

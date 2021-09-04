import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
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
import { GetDmsDto } from './dto/get-dms.dto';

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

  @ApiOperation({ summary: '특정 유저와 나눈 DM을 가져옵니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @Get()
  getDms(
    @GetUser() user: User,
    @Query() { opposite: oppositeName, search, perPage, page }: GetDmsDto,
  ): Promise<Dm[]> {
    return this.dmsService.getDms(user, oppositeName, search, perPage, page);
  }
}

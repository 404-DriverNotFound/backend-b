import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { SecondFactorAuthenticatedGuard } from 'src/auth/guards/second-factor-authenticated.guard';
import { GetChannelChatsCountDto } from 'src/channels/dto/get-channel-chats-count.dto';
import { PaginationFilterDto } from 'src/channels/dto/pagination-filter.dto';
import { User } from 'src/users/entities/user.entity';
import { GetUser } from 'src/users/get-user.decorator';
import { Dm } from './dm.entity';
import { DmsService } from './dms.service';
import { CreateDmDto } from './dto/create-dm.dto';
import { GetDMersFilterDto } from './dto/get-dmers.dto';

@ApiTags('Dms')
@ApiCookieAuth()
@UseGuards(AuthenticatedGuard)
@UseGuards(SecondFactorAuthenticatedGuard)
@Controller()
export class DmsController {
  constructor(private readonly dmsService: DmsService) {}

  @ApiOperation({ summary: '특정 유저에게 DM을 보냅니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @Post('dms')
  createDM(
    @GetUser() user: User,
    @Body() { name, content }: CreateDmDto,
  ): Promise<Dm> {
    return this.dmsService.createDM(user, name, content);
  }

  @ApiOperation({ summary: '특정 유저와 나눈 DM을 가져옵니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @Get('dms/opposite/:name')
  getDMsByOppositeName(
    @GetUser() user: User,
    @Param('name') oppositeName: string,
    @Query() { search, perPage, page }: PaginationFilterDto,
  ): Promise<Dm[]> {
    return this.dmsService.getDMsByOppositeName(
      user,
      oppositeName,
      search,
      perPage,
      page,
    );
  }

  @ApiOperation({
    summary: '특정 시점 이후에 특정 유저와 나눈 DM의 갯수를 가져옵니다.',
  })
  @ApiResponse({ status: 200, description: '성공' })
  @Get('dms/opposite/:name/count')
  getDMsByOppositeNameCount(
    @GetUser() user: User,
    @Param('name') oppositeName: string,
    @Query() { after }: GetChannelChatsCountDto,
  ): Promise<number> {
    return this.dmsService.getDMsByOppositeNameCount(user, oppositeName, after);
  }

  @ApiOperation({ summary: '나와 DM을 나눈 유저 목록을 가져옵니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @Get('dmers')
  getDMers(
    @GetUser() user: User,
    @Query() { perPage, page }: GetDMersFilterDto,
  ): Promise<User[]> {
    return this.dmsService.getDMers(user, perPage, page);
  }
}

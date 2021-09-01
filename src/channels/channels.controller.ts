import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
import { GetUser } from 'src/users/get-user.decorator';
import { User } from 'src/users/user.entity';
import { Channel } from './channel.entity';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { GetChannelsFilterDto } from './dto/get-channels-filter.dto';
import { UpdateChannelPasswordDto } from './dto/update-channel.dto';

@ApiTags('Channels')
@ApiCookieAuth()
@UseGuards(AuthenticatedGuard)
@UseGuards(SecondFactorAuthenticatedGuard)
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @ApiOperation({ summary: '전체 채널 목록을 가져옵니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @Get()
  getChannels(
    @Query() { search, perPage, page }: GetChannelsFilterDto,
  ): Promise<Channel[]> {
    return this.channelsService.getChannels(search, perPage, page);
  }

  @ApiOperation({ summary: '채널을 추가합니다.' })
  @ApiResponse({ status: 201, description: '성공' })
  @ApiResponse({ status: 409, description: '채널 중복' })
  @ApiResponse({ status: 500, description: '서버 에러' })
  @Post()
  createChannel(
    @GetUser() user: User,
    @Body() { name, password }: CreateChannelDto,
  ): Promise<Channel> {
    return this.channelsService.createChannel(user, name, password);
  }

  @ApiOperation({ summary: '채널 비밀번호를 수정/제거합니다.' })
  @ApiResponse({ status: 201, description: '성공' })
  @ApiResponse({ status: 500, description: '서버 에러' })
  @Patch(':name/password')
  updateChannelPassword(
    @GetUser() user: User,
    @Param('name') name: string,
    @Body() { password }: UpdateChannelPasswordDto,
  ): Promise<Channel> {
    return this.channelsService.updateChannelPassword(user, name, password);
  }
}

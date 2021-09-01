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
import { Channel } from './channel.entity';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';

@ApiTags('Channels')
@ApiCookieAuth()
@UseGuards(AuthenticatedGuard)
@UseGuards(SecondFactorAuthenticatedGuard)
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

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
}

import {
  Body,
  Controller,
  Delete,
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
import { Channel } from './entities/channel.entity';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelPasswordDto } from './dto/update-channel-password.dto';
import { CreateChannelMemberDto } from './dto/create-channel-member.dto';
import { PaginationFilterDto } from './dto/pagination-filter.dto';
import { Chat } from './entities/chat.entity';
import { CreateChannelChatDto } from './dto/create-channel-chat.dto';
import { GetChannelChatsCountDto } from './dto/get-channel-chats-count.dto';

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
    @Query() { search, perPage, page }: PaginationFilterDto,
  ): Promise<Channel[]> {
    return this.channelsService.getChannels(search, perPage, page);
  }

  @ApiOperation({ summary: '내가 속한 채널 목록을 가져옵니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @Get('me')
  getChannelsByMe(
    @GetUser() user: User,
    @Query() { search, perPage, page }: PaginationFilterDto,
  ): Promise<Channel[]> {
    return this.channelsService.getChannelsByMe(user, search, perPage, page);
  }

  @ApiOperation({ summary: '이름으로 특정 채널 정보를 가져옵니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 404, description: '채널 없음' })
  @Get(':name')
  getChannelByName(@Param('name') name: string): Promise<Channel> {
    return this.channelsService.getChannelByName(name);
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

  @ApiOperation({ summary: '특정 채널에 유저를(가) 추가(입장)합니다.' })
  @ApiResponse({ status: 201, description: '성공' })
  @ApiResponse({ status: 404, description: '찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 에러' })
  @Post(':name/members')
  createChannelMember(
    @Param('name') name: string,
    @Body() { memberName, password }: CreateChannelMemberDto,
  ) {
    return this.channelsService.createChannelMember(name, memberName, password);
  }

  @ApiOperation({ summary: '특정 채널의 유저목록을 가져옵니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 404, description: '채널 없음' })
  @Get(':name/members')
  getChannelMembers(
    @Param('name') name: string,
    @Query() { search, perPage, page }: PaginationFilterDto,
  ): Promise<User[]> {
    return this.channelsService.getChannelMembers(name, search, perPage, page);
  }

  @ApiOperation({ summary: '특정 채널에서 유저를 제거(강퇴, 퇴장)합니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 404, description: '채널, 유저 없음' })
  @Delete(':name/members/:memberName')
  deleteChannelMember(
    @Param('name') name: string,
    @Param('memberName') memberName: string,
  ): Promise<void> {
    return this.channelsService.deleteChannelMember(name, memberName);
  }

  @ApiOperation({ summary: '특정 채널의 채팅을 추가합니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 404, description: '채널 없음' })
  @Post(':name/chats')
  createChannelChat(
    @Param('name') name: string,
    @GetUser() user: User,
    @Body() { content }: CreateChannelChatDto,
  ): Promise<Chat> {
    return this.channelsService.createChannelChat(name, user, content);
  }

  @ApiOperation({ summary: '특정 채널의 채팅을 모두 가져옵니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 404, description: '채널 없음' })
  @Get(':name/chats')
  getChannelChats(
    @Param('name') name: string,
    @Query() { search, perPage, page }: PaginationFilterDto,
  ): Promise<Chat[]> {
    return this.channelsService.getChannelChats(name, search, perPage, page);
  }

  @ApiOperation({
    summary: '특정 시점 이후에 생성된 채팅의 갯수를 가져옵니다.',
  })
  @ApiResponse({ status: 200, description: '성공' })
  @Get(':name/chats/count')
  getChannelChatsCount(
    @Param('name') name: string,
    @Query() { after }: GetChannelChatsCountDto,
  ): Promise<number> {
    return this.channelsService.getChannelChatsCount(name, after);
  }
}

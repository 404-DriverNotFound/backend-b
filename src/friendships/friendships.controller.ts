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
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { GetFriendshipsFilterDto } from './dto/get-friendships-filter.dto';
import { UpdateFriendshipStatusDto } from './dto/update-friendship-status.dto';
import { Friendship } from './friendship.entity';
import { FriendshipsService } from './friendships.service';

@ApiTags('Friendships')
@ApiCookieAuth()
@Controller()
export class FriendshipsController {
  constructor(private readonly friendshipsService: FriendshipsService) {}

  @ApiOperation({ summary: '대기중인 친구 요청 목록을 가져옵니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @Get('friendships')
  @UseGuards(AuthenticatedGuard)
  @UseGuards(SecondFactorAuthenticatedGuard)
  getFriendships(
    @GetUser() user: User,
    @Query() filterDto: GetFriendshipsFilterDto,
  ): Promise<Friendship> {
    return this.friendshipsService.getFriendships(user, filterDto);
  }

  @ApiOperation({ summary: '친구 관계(친구)를 요청(추가)합니다.' })
  @ApiResponse({ status: 201, description: '성공' })
  @ApiResponse({ status: 400, description: '자기 자신을 요청했을 때' })
  @ApiResponse({ status: 404, description: '없는 유저를 요청했을 때' })
  //@ApiResponse({ status: 409, description: '이미 추가된 요청일 때' })
  @ApiResponse({ status: 500, description: '서버 에러' })
  @Post('friendships')
  @UseGuards(AuthenticatedGuard)
  @UseGuards(SecondFactorAuthenticatedGuard)
  createFriendship(
    @GetUser() requester: User,
    @Body() createFriendshipDto: CreateFriendshipDto,
  ): Promise<Friendship> {
    return this.friendshipsService.createFriendship(
      requester,
      createFriendshipDto,
    );
  }

  @ApiOperation({ summary: '친구 요청을 취소(삭제)합니다.' })
  //@ApiResponse({ status: 201, description: '성공' })
  //@ApiResponse({ status: 400, description: '자기 자신을 추가했을 때' })
  //@ApiResponse({ status: 404, description: '없는 유저를 추가했을 때' })
  //@ApiResponse({ status: 409, description: '이미 추가된 요청일 때' })
  //@ApiResponse({ status: 500, description: '서버 에러' })
  @Delete('friendships/:name')
  @UseGuards(AuthenticatedGuard)
  @UseGuards(SecondFactorAuthenticatedGuard)
  deleteFriendship(
    @GetUser() user: User,
    @Param('name') opponentName: string,
  ): Promise<Friendship> {
    return this.friendshipsService.deleteFriendship(user, opponentName);
  }

  @ApiOperation({
    summary: '상대방과의 친구 관계 상태를 수정합니다.',
    description: '친구 요청 수락 and 친구 요청 거절',
  })
  //@ApiResponse({ status: 201, description: '성공' })
  //@ApiResponse({ status: 400, description: '자기 자신을 추가했을 때' })
  //@ApiResponse({ status: 404, description: '없는 유저를 추가했을 때' })
  //@ApiResponse({ status: 409, description: '이미 추가된 요청일 때' })
  //@ApiResponse({ status: 500, description: '서버 에러' })
  @Patch('friendships/:name/status')
  @UseGuards(AuthenticatedGuard)
  @UseGuards(SecondFactorAuthenticatedGuard)
  updateFriendshipStatus(
    @GetUser() user: User,
    @Param('name') opponentName: string,
    @Body() updateFriendshipStatusDto: UpdateFriendshipStatusDto,
  ): Promise<Friendship> {
    return this.friendshipsService.updateFriendshipStatus(
      user,
      opponentName,
      updateFriendshipStatusDto,
    );
  }

  @ApiOperation({
    summary: '친구 목록을 가져옵니다.',
  })
  @Get('friends')
  @UseGuards(AuthenticatedGuard)
  @UseGuards(SecondFactorAuthenticatedGuard)
  getFriends(@GetUser() user: User): Promise<Friendship> {
    return this.friendshipsService.getFriends(user);
  }

  @ApiOperation({
    summary: '특정 친구를 삭제합니다.',
  })
  //@ApiResponse({ status: 201, description: '성공' })
  //@ApiResponse({ status: 400, description: '자기 자신을 추가했을 때' })
  //@ApiResponse({ status: 404, description: '없는 유저를 추가했을 때' })
  //@ApiResponse({ status: 409, description: '이미 추가된 요청일 때' })
  //@ApiResponse({ status: 500, description: '서버 에러' })
  @Delete('friends/:name')
  @UseGuards(AuthenticatedGuard)
  @UseGuards(SecondFactorAuthenticatedGuard)
  deleteFriend(
    @GetUser() user: User,
    @Param('name') opponentName: string,
  ): Promise<Friendship> {
    return this.friendshipsService.deleteFriend(user, opponentName);
  }

  @ApiOperation({
    summary: '차단된 친구 목록을 가져옵니다.',
  })
  //@ApiResponse({ status: 201, description: '성공' })
  //@ApiResponse({ status: 400, description: '자기 자신을 추가했을 때' })
  //@ApiResponse({ status: 404, description: '없는 유저를 추가했을 때' })
  //@ApiResponse({ status: 409, description: '이미 추가된 요청일 때' })
  //@ApiResponse({ status: 500, description: '서버 에러' })
  @Get('blacks')
  @UseGuards(AuthenticatedGuard)
  @UseGuards(SecondFactorAuthenticatedGuard)
  getBlacks(@GetUser() user: User): Promise<Friendship> {
    return this.friendshipsService.getBlacks(user);
  }

  @ApiOperation({
    summary: '특정 유저를 차단합니다.',
  })
  @Post('blacks')
  @UseGuards(AuthenticatedGuard)
  @UseGuards(SecondFactorAuthenticatedGuard)
  createBlack(
    @GetUser() requester: User,
    @Body() createFriendshipDto: CreateFriendshipDto,
  ): Promise<Friendship> {
    return this.friendshipsService.createBlack(requester, createFriendshipDto);
  }

  @ApiOperation({
    summary: '특정 유저의 차단을 해제합니다.',
  })
  @Delete('blacks/:name')
  @UseGuards(AuthenticatedGuard)
  @UseGuards(SecondFactorAuthenticatedGuard)
  deleteBlack(
    @GetUser() user: User,
    @Param('name') opponentName: string,
  ): Promise<Friendship> {
    return this.friendshipsService.deleteBlack(user, opponentName);
  }
}

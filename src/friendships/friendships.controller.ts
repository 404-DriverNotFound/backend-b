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
import { GetFriendsFilterDto } from './dto/get-friends-filter.dto';
import { UpdateFriendshipStatusDto } from './dto/update-friendship-status.dto';
import { Friendship } from './friendship.entity';
import { FriendshipsService } from './friendships.service';

@ApiTags('Friendships')
@ApiCookieAuth()
@Controller()
export class FriendshipsController {
  constructor(private readonly friendshipsService: FriendshipsService) {}

  @ApiOperation({ summary: '친구 관계(친구)를 요청(추가)합니다.' })
  @ApiResponse({ status: 201, description: '성공' })
  @ApiResponse({ status: 400, description: '요청이 잘못됐을 때' })
  @ApiResponse({ status: 404, description: '없는 유저를 요청했을 때' })
  @ApiResponse({
    status: 409,
    description: '자기 자신을 요청했을 때, 친구 관계 이력이 있을 때',
  })
  @ApiResponse({ status: 500, description: '서버 에러' })
  @Post('friendships')
  @UseGuards(AuthenticatedGuard)
  @UseGuards(SecondFactorAuthenticatedGuard)
  createFriendship(
    @GetUser() requester: User,
    @Body() { addresseeName }: CreateFriendshipDto,
  ): Promise<Friendship> {
    return this.friendshipsService.createFriendship(requester, addresseeName);
  }

  @ApiOperation({ summary: '특정 유저와의 관계를 가져옵니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 400, description: '요청이 잘못됐을 때' })
  @ApiResponse({ status: 404, description: '관계를 알 수 없을 때' })
  @ApiResponse({ status: 409, description: '자기 자신과의 관계를 삭제했을 때' })
  @Get('friendships/:name')
  @UseGuards(AuthenticatedGuard)
  @UseGuards(SecondFactorAuthenticatedGuard)
  getFriendshipByName(
    @GetUser() user: User,
    @Param('name') opponentName: string,
  ): Promise<Friendship> {
    return this.friendshipsService.getFriendshipByName(user, opponentName);
  }

  @ApiOperation({ summary: '친구 요청을 취소(삭제)합니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 400, description: '요청이 잘못됐을 때' })
  @ApiResponse({ status: 404, description: '없는 관계를 삭제했을 때' })
  @ApiResponse({ status: 409, description: '자기 자신과의 관계를 삭제했을 때' })
  @Delete('friendships/:name')
  @UseGuards(AuthenticatedGuard)
  @UseGuards(SecondFactorAuthenticatedGuard)
  deleteFriendship(
    @GetUser() requester: User,
    @Param('name') addresseeName: string,
  ): Promise<void> {
    return this.friendshipsService.deleteFriendship(requester, addresseeName);
  }

  @ApiOperation({
    summary: '요청 받은 친구 관계 상태를 수정합니다.',
    description: '친구 요청 수락 and 친구 요청 거절',
  })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({
    status: 404,
    description: '없는 유저를 추가했을 때, 요청받은 친구관계가 없을 때',
  })
  @ApiResponse({ status: 409, description: '자기 자신을 추가했을 때' })
  @ApiResponse({ status: 500, description: '서버 에러' })
  @Patch('friendships/:name/status')
  @UseGuards(AuthenticatedGuard)
  @UseGuards(SecondFactorAuthenticatedGuard)
  updateFriendshipStatus(
    @Param('name') requesterName: string,
    @GetUser() addressee: User,
    @Body() { status }: UpdateFriendshipStatusDto,
  ): Promise<Friendship> {
    return this.friendshipsService.updateFriendshipStatus(
      requesterName,
      addressee,
      status,
    );
  }

  @ApiOperation({
    summary: '친구 목록을 가져옵니다.',
    description:
      '나랑 친구인 유저 목록(쿼리 없이 요청을 보낼 시), 내가 친구 요청한 유저 목록, 나에게 친구요청한 유저 목록',
  })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @Get('friends')
  @UseGuards(AuthenticatedGuard)
  @UseGuards(SecondFactorAuthenticatedGuard)
  getFriends(
    @GetUser() user: User,
    @Query() { role, status }: GetFriendsFilterDto,
  ): Promise<User[]> {
    return this.friendshipsService.getFriends(user, role, status);
  }

  @ApiOperation({
    summary: '특정 친구를 삭제합니다.',
  })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({
    status: 404,
    description: '없는 유저를 추가했을 때, 친구 관계가 없을 때',
  })
  @ApiResponse({ status: 409, description: '자기 자신을 추가했을 때' })
  @Delete('friends/:name')
  @UseGuards(AuthenticatedGuard)
  @UseGuards(SecondFactorAuthenticatedGuard)
  deleteFriend(
    @GetUser() user: User,
    @Param('name') opponentName: string,
  ): Promise<void> {
    return this.friendshipsService.deleteFriend(user, opponentName);
  }

  @ApiOperation({
    summary: '차단한 유저목록을 가져옵니다.',
  })
  @ApiResponse({ status: 200, description: '성공' })
  @Get('blacks')
  @UseGuards(AuthenticatedGuard)
  @UseGuards(SecondFactorAuthenticatedGuard)
  getBlacks(@GetUser() requester: User): Promise<User[]> {
    return this.friendshipsService.getBlacks(requester);
  }

  @ApiOperation({
    summary: '특정 유저를 차단합니다.',
  })
  @ApiResponse({ status: 201, description: '차단 성공' })
  @ApiResponse({ status: 400, description: '요청이 잘못됐을 때' })
  @ApiResponse({ status: 404, description: '없는 유저를 차단했을 때' })
  @Post('blacks')
  @UseGuards(AuthenticatedGuard)
  @UseGuards(SecondFactorAuthenticatedGuard)
  createBlack(
    @GetUser() requester: User,
    @Body() { addresseeName }: CreateFriendshipDto,
  ): Promise<Friendship> {
    return this.friendshipsService.createBlack(requester, addresseeName);
  }

  @ApiOperation({
    summary: '특정 유저의 차단을 해제합니다.',
  })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 400, description: '요청이 잘못됐을 때' })
  @ApiResponse({
    status: 404,
    description: '없는 유저나 관계를 차단 해제했을 때',
  })
  @ApiResponse({ status: 409, description: '자기 자신을 차단 해제했을 때' })
  @Delete('blacks/:name')
  @UseGuards(AuthenticatedGuard)
  @UseGuards(SecondFactorAuthenticatedGuard)
  deleteBlack(
    @GetUser() requester: User,
    @Param('name') addresseeName: string,
  ): Promise<void> {
    return this.friendshipsService.deleteBlack(requester, addresseeName);
  }
}

import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { SecondFactorAuthenticatedGuard } from 'src/auth/guards/second-factor-authenticated.guard';
import { GetUser } from 'src/users/get-user.decorator';
import { User } from 'src/users/user.entity';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { Friendship } from './friendship.entity';
import { FriendshipsService } from './friendships.service';

@Controller('friendships')
export class FriendshipsController {
  constructor(private readonly friendshipsService: FriendshipsService) {}

  @ApiCookieAuth()
  @ApiOperation({ summary: '친구관계를 추가합니다.' })
  @ApiResponse({ status: 201, description: '성공' })
  @ApiResponse({ status: 400, description: '자기 자신을 추가했을 때' })
  @ApiResponse({ status: 404, description: '없는 유저를 추가했을 때' })
  @ApiResponse({ status: 409, description: '이미 추가된 요청일 때' })
  @ApiResponse({ status: 500, description: '서버 에러' })
  @Post()
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
}

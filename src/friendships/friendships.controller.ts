import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
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
@Controller('friendships')
export class FriendshipsController {
  constructor(private readonly friendshipsService: FriendshipsService) {}

  @ApiOperation({ summary: '나의 친구관계를 가져옵니다(DECLINE 제외).' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 500, description: '서버 에러' })
  @Get()
  getFriendships(
    @GetUser() user: User,
    @Query() filterDto: GetFriendshipsFilterDto,
  ): Promise<Friendship[]> {
    return this.friendshipsService.getFriendships(user, filterDto);
  }

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

  @ApiCookieAuth()
  @ApiOperation({ summary: '친구 관계를 수정합니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 500, description: '서버 에러' })
  @Patch(':uuid/status')
  updateFriendshipStatus(
    @GetUser() user: User,
    @Param('uuid', ParseUUIDPipe) id: string,
    @Body() updateFriendshipStatusDto: UpdateFriendshipStatusDto,
  ): Promise<Friendship> {
    const { status } = updateFriendshipStatusDto;
    return this.friendshipsService.updateFriendshipStatus(user, id, status);
  }
}

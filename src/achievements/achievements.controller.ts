import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { SecondFactorAuthenticatedGuard } from 'src/auth/guards/second-factor-authenticated.guard';
import { User } from 'src/users/entities/user.entity';
import { GetUser } from 'src/users/get-user.decorator';
import { AchievementsService } from './achievements.service';
import { Achievement } from './entities/achievement.entity';

@ApiTags('Achievements')
@ApiCookieAuth()
@UseGuards(AuthenticatedGuard)
@UseGuards(SecondFactorAuthenticatedGuard)
@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @ApiOperation({ summary: '나의 업적 목록을 가져옵니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @Get()
  getAchievements(@GetUser() user: User): Promise<Achievement[]> {
    return this.achievementsService.getAchievements(user);
  }

  @ApiOperation({ summary: '특정 유저의 업적 목록을 가져옵니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @Get(':name')
  getUserAchievements(@Param('name') name: string): Promise<Achievement[]> {
    return this.achievementsService.getUserAchievements(name);
  }
}

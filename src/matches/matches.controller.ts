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
import { CreateMatchDto } from './dto/create-match.dto';
import { GetMatchesFilterDto } from './dto/get-matches-filter.dto';
import { Match } from './match.entity';
import { MatchesService } from './matches.service';

@ApiCookieAuth()
@ApiTags('Matches')
@Controller('matches')
@UseGuards(AuthenticatedGuard)
@UseGuards(SecondFactorAuthenticatedGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @ApiOperation({ summary: '나의 모든 매치 정보를 가져옵니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @Get()
  getMatches(
    @GetUser() user: User,
    @Query() { status }: GetMatchesFilterDto,
  ): Promise<Match[]> {
    // TODO PAGINATION
    return this.matchesService.getMatches(user, status);
  }

  @ApiOperation({ summary: '매치를 추가합니다.' })
  @ApiResponse({ status: 201, description: '성공' })
  @Post()
  createMatch(
    @GetUser() user: User,
    @Body() { name, type }: CreateMatchDto,
  ): Promise<Match> {
    // TODO PAGINATION
    return this.matchesService.createMatch(user, name, type);
  }
}

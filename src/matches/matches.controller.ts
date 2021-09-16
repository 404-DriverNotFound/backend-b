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
import { User } from 'src/users/entities/user.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { GetMatchesCountFilterDto } from './dto/get-matches-count-filter.dto';
import { GetMatchesFilterDto } from './dto/get-matches-filter.dto';
import { GetSpectateFilterDto } from './dto/get-spectate-filter.dto';
import { Match } from './match.entity';
import { MatchesService } from './matches.service';

@ApiCookieAuth()
@ApiTags('Matches')
@Controller('matches')
@UseGuards(AuthenticatedGuard)
@UseGuards(SecondFactorAuthenticatedGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @ApiOperation({ summary: '관전 가능한 모든 매치 정보를 가져옵니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @Get()
  getMatches(@Query() { type }: GetSpectateFilterDto): Promise<Match[]> {
    // TODO PAGINATION
    return this.matchesService.getMatches(type);
  }

  @ApiOperation({ summary: '나의 모든 매치 정보를 가져옵니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @Get('me')
  getMyMatches(
    @GetUser() user: User,
    @Query() { status, type }: GetMatchesFilterDto,
  ): Promise<Match[]> {
    // TODO PAGINATION
    return this.matchesService.getMyMatches(user, status, type);
  }

  @ApiOperation({ summary: '나의 종료된 매치 갯수를 가져옵니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @Get('count')
  getMatchesCount(
    @GetUser() user: User,
    @Query() { result }: GetMatchesCountFilterDto,
  ): Promise<number> {
    return this.matchesService.getMatchesCount(user, result);
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

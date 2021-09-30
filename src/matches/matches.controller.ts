import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
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
import { GetSpectatingFilterDto } from './dto/get-spectating-filter.dto';
import { Match } from './match.entity';
import { MatchesService } from './matches.service';
import { PaginationMatchFilterDto } from './dto/pagination-match-filter.dto';
import { GetMatchesInfoFilterDto } from './dto/get-matches-info-filter.dto';

@ApiCookieAuth()
@ApiTags('Matches')
@Controller('matches')
@UseGuards(AuthenticatedGuard)
@UseGuards(SecondFactorAuthenticatedGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @ApiOperation({ summary: '모든 매치 정보를 가져옵니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @Get()
  getMatches(
    @Query() { perPage, page }: PaginationMatchFilterDto,
  ): Promise<Match[]> {
    return this.matchesService.getMatches(perPage, page);
  }

  @ApiOperation({ summary: '관전 가능한 모든 매치 정보를 가져옵니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @Get('spectating')
  getSpectatingMatches(
    @Query() { type, perPage, page }: GetSpectatingFilterDto,
  ): Promise<Match[]> {
    return this.matchesService.getSpectatingMatches(type, perPage, page);
  }

  @ApiOperation({ summary: '나의 모든 매치 정보를 가져옵니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @Get('me')
  getMyMatches(
    @GetUser() user: User,
    @Query() { status, type, perPage, page }: GetMatchesInfoFilterDto,
  ): Promise<Match[]> {
    return this.matchesService.getMyMatches(user, status, type, perPage, page);
  }

  @ApiOperation({ summary: '특정 유저의 모든 매치 정보를 가져옵니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @Get(':name')
  getUserMatches(
    @Param('name') name: string,
    @Query() { type, status, perPage, page }: GetMatchesInfoFilterDto,
  ): Promise<Match[]> {
    return this.matchesService.getUserMatches(
      name,
      type,
      status,
      perPage,
      page,
    );
  }
}

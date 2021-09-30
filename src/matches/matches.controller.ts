import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { SecondFactorAuthenticatedGuard } from 'src/auth/guards/second-factor-authenticated.guard';
import { GetSpectatingFilterDto } from './dto/get-spectating-filter.dto';
import { Match } from './match.entity';
import { MatchesService } from './matches.service';

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
  getSpectatingMatches(
    @Query() { type, perPage, page }: GetSpectatingFilterDto,
  ): Promise<Match[]> {
    return this.matchesService.getSpectatingMatches(type, perPage, page);
  }
}

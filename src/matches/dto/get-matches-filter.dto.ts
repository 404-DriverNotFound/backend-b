import { MatchType } from '../constants/match-type.enum';
import { MatchStatus } from '../constants/match-status.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationMatchFilterDto } from './pagination-match-filter.dto';

export class GetMatchesFilterDto extends PaginationMatchFilterDto {
  @ApiProperty({
    example: MatchType.LADDER,
    required: false,
    enum: MatchType,
  })
  @IsOptional()
  @IsEnum(MatchType)
  readonly type?: MatchType;

  @ApiProperty({
    example: MatchStatus.IN_PROGRESS,
    required: false,
    enum: MatchStatus,
  })
  @IsOptional()
  @IsEnum(MatchStatus)
  readonly status?: MatchStatus;
}

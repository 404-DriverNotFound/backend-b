import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { MatchStatus } from '../constants/match-status.enum';
import { CreateMatchDto } from './create-match.dto';
import { PaginationMatchFilterDto } from './pagination-match-filter.dto';
import { Type } from 'class-transformer';

export class GetMatchesFilterDto extends PartialType(
  PickType(CreateMatchDto, ['type'] as const),
) {
  @ApiProperty({
    example: MatchStatus.IN_PROGRESS,
    required: false,
    enum: MatchStatus,
  })
  @IsOptional()
  @IsEnum(MatchStatus)
  readonly status?: MatchStatus;

  @ApiProperty({
    description: 'counts per page',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  readonly perPage?: number;

  @ApiProperty({
    description: 'pages',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  readonly page?: number;
}

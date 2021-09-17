import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { MatchType } from '../constants/match-type.enum';
import { PaginationMatchFilterDto } from './pagination-match-filter.dto';

export class GetSpectatingFilterDto extends PickType(PaginationMatchFilterDto, [
  'page',
  'perPage',
] as const) {
  @ApiProperty({
    example: MatchType.LADDER,
    required: false,
    enum: MatchType,
  })
  @IsOptional()
  @IsEnum(MatchType)
  readonly type?: MatchType;
}

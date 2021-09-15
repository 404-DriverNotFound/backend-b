import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { MatchStatus } from '../match-status.enum';
import { CreateMatchDto } from './create-match.dto';

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
}

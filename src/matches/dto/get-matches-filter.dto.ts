import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { MatchStatus } from '../match-status.enum';

export class GetMatchesFilterDto {
  @ApiProperty({
    example: MatchStatus.IN_PROGRESS,
    required: false,
    enum: MatchStatus,
  })
  @IsOptional()
  @IsEnum(MatchStatus)
  readonly status?: MatchStatus;
}

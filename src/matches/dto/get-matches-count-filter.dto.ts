import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { MatchResult } from '../match-result.enum';

export class GetMatchesCountFilterDto {
  @ApiProperty({
    example: MatchResult.WIN,
    required: false,
    enum: MatchResult,
  })
  @IsOptional()
  @IsEnum(MatchResult)
  readonly result?: MatchResult;
}

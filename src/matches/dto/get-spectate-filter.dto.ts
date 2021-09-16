import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { MatchType } from '../constants/match-type.enum';

export class GetSpectateFilterDto {
  @ApiProperty({
    example: MatchType.LADDER,
    required: true,
    enum: MatchType,
  })
  @IsNotEmpty()
  @IsEnum(MatchType)
  readonly type!: MatchType;
}

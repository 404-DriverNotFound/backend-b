import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { MatchType } from '../constants/match-type.enum';
import { MatchGameMode } from '../constants/match-game-mode.enum';

export class CreateMatchDto extends PickType(CreateUserDto, ['name'] as const) {
  @ApiProperty({
    example: MatchType.LADDER,
    required: true,
    enum: MatchType,
  })
  @IsNotEmpty()
  @IsEnum(MatchType)
  readonly type!: MatchType;

  @ApiProperty({
    example: MatchGameMode.CLASSIC,
    required: true,
    enum: MatchGameMode,
  })
  @IsNotEmpty()
  @IsEnum(MatchGameMode)
  readonly mode!: MatchGameMode;
}

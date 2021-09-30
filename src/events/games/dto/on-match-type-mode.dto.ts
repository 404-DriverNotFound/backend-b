import { MatchType } from '../../../matches/constants/match-type.enum';
import { MatchGameMode } from '../../../matches/constants/match-game-mode.enum';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class OnMatchTypeModeDto {
  @IsNotEmpty()
  @IsEnum(MatchType)
  readonly type!: MatchType;

  @IsNotEmpty()
  @IsEnum(MatchGameMode)
  readonly mode!: MatchGameMode;
}

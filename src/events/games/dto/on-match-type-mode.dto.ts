import { MatchType } from '../../../matches/constants/match-type.enum';
import { MatchGameMode } from '../../../matches/constants/match-game-mode.enum';

export interface OnMatchTypeModeDto {
  readonly type: MatchType;
  readonly mode: MatchGameMode;
}

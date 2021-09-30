import { MatchType } from '../../../matches/constants/match-type.enum';
import { MatchGameMode } from '../../../matches/constants/match-game-mode.enum';

export class OnMatchTypeModeDto {
  type: MatchType;
  mode: MatchGameMode;
}

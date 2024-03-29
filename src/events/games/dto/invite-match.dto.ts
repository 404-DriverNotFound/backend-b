import { MatchGameMode } from 'src/matches/constants/match-game-mode.enum';

export interface InviteMatchDto {
  readonly mode: MatchGameMode;

  readonly opponentUserId: string;

  readonly opponentSocketId: string;
}

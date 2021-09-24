import { GameStatus } from '../constants/game-status.enum';
import { Racket } from './racket.class';
import { Room } from './room.class';

export class Base {
  status: GameStatus = GameStatus.NONE;

  racket: Racket = null;

  update: (room: Room) => void;

  reset(): void {
    this.status = GameStatus.NONE;
    this.racket = null;
    this.update = null;
  }
}

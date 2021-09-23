import { GameStatus } from './game-status.enum';
import { Racket } from './racket';
import { Room } from './room';

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

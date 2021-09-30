//import { GameStatus } from '../constants/game-status.enum';
import { Rectangle } from '../interfaces/rectangle.interface';
import { Room } from './room.class';

export class Base implements Rectangle {
  //status: GameStatus = GameStatus.NONE;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;

  update: (room: Room) => void;

  reset(): void {
    //this.status = GameStatus.NONE;
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.color = '#000000';
    this.update = null;
  }
}

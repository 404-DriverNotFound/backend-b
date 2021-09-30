import { Base } from './base.class';
import { GameStatus } from '../constants/game-status.enum';
import { KeyCode } from '../constants/key-code.enum';
import { PlayerPosition } from '../constants/player-position.enum';
import { Room } from './room.class';
import { SETTINGS } from '../constants/SETTINGS';

const UNIT = 2;

export class Player extends Base {
  id: string;

  score = 0;

  ready = false;

  keypress: {
    [KeyCode.LEFT]: boolean;
    [KeyCode.UP]: boolean;
    [KeyCode.RIGHT]: boolean;
    [KeyCode.DOWN]: boolean;
  } = {
    [KeyCode.LEFT]: false,
    [KeyCode.UP]: false,
    [KeyCode.RIGHT]: false,
    [KeyCode.DOWN]: false,
  };

  constructor(id: string, position: PlayerPosition) {
    super();

    this.id = id;

    this.x =
      position === 'LEFT'
        ? SETTINGS.PLAYER.GAP
        : SETTINGS.WIDTH - SETTINGS.PLAYER.GAP;
    this.y = SETTINGS.HEIGHT / 2;
    this.width = SETTINGS.PLAYER.WIDTH;
    this.height = SETTINGS.PLAYER.HEIGHT;

    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += Math.floor(Math.random() * 16).toString(16);
    }
    this.color = color;

    this.update = this.setUpdate;
  }

  setUpdate(room: Room): void {
    if (
      room.status === GameStatus.COUNTDOWN ||
      room.status === GameStatus.PLAYING
    ) {
      if (this.keypress[KeyCode.UP]) {
        this.moveUp();
      }
      if (this.keypress[KeyCode.DOWN]) {
        this.moveDown();
      }
    }
  }

  moveUp(): void {
    if (this.y - this.height / 2 - UNIT >= 0 + SETTINGS.BORDER_WIDTH) {
      this.y -= UNIT;
    }
  }

  moveDown(): void {
    if (
      this.y + this.height / 2 + UNIT <=
      SETTINGS.HEIGHT - SETTINGS.BORDER_WIDTH
    ) {
      this.y += UNIT;
    }
  }
}

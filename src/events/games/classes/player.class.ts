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

  mouse: {
    move: { x: number; y: number };
    click: { x: number; y: number };
  } = { move: null, click: null };

  constructor(id: string, position: PlayerPosition) {
    super();

    this.id = id;

    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += Math.floor(Math.random() * 16).toString(16);
    }

    this.racket = {
      x:
        position === 'LEFT'
          ? SETTINGS.PLAYER.GAP
          : SETTINGS.WIDTH - SETTINGS.PLAYER.GAP,
      y: SETTINGS.HEIGHT / 2,
      width: SETTINGS.PLAYER.WIDTH,
      height: SETTINGS.PLAYER.HEIGHT,
      color,
    };

    this.update = this.setUpdate;
  }

  setUpdate(room: Room): void {
    const player = this.racket;

    if (
      room.status === GameStatus.COUNTDOWN ||
      room.status === GameStatus.PLAYING
    ) {
      if (this.keypress[KeyCode.UP]) {
        this.moveUp();
        this.mouse.click = null;
      }
      if (this.keypress[KeyCode.DOWN]) {
        this.moveDown();
        this.mouse.click = null;
      }
      if (
        this.mouse.click &&
        ((this.mouse.click.x < player.x + 50 &&
          this.mouse.click.x > player.x - 50) ||
          this.mouse.click.x === null)
      ) {
        if (this.mouse.click.y < player.y - 5) {
          this.moveUp();
        } else if (this.mouse.click.y > player.y + 5) {
          this.moveDown();
        } else {
          this.mouse.click = null;
        }
      }
    }
  }

  moveUp(): void {
    if (
      this.racket.y - this.racket.height / 2 - UNIT >=
      0 + SETTINGS.BORDER_WIDTH
    ) {
      this.racket.y -= UNIT;
    }
  }

  moveDown(): void {
    if (
      this.racket.y + this.racket.height / 2 + UNIT <=
      SETTINGS.HEIGHT - SETTINGS.BORDER_WIDTH
    ) {
      this.racket.y += UNIT;
    }
  }
}

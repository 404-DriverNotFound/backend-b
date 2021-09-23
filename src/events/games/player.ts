import { Base } from './base';
import { GameStatus } from './game-status.enum';
import { PlayerPosition } from './player-position.enum';
import { Room } from './room';
import { SETTINGS } from './SETTINGS';

enum KeypressType {
  LEFT = 37,
  UP,
  RIGHT,
  DOWN,
}
const UNIT = 2;

export class Player extends Base {
  id: string;

  score = 0;

  ready = false;

  keypress: {
    [KeypressType.LEFT]: boolean;
    [KeypressType.UP]: boolean;
    [KeypressType.RIGHT]: boolean;
    [KeypressType.DOWN]: boolean;
  } = {
    [KeypressType.LEFT]: false,
    [KeypressType.UP]: false,
    [KeypressType.RIGHT]: false,
    [KeypressType.DOWN]: false,
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
      if (this.keypress[KeypressType.UP]) {
        this.moveUp();
        this.mouse.click = null;
      }
      if (this.keypress[KeypressType.DOWN]) {
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

import { Base } from './base.class';
import { GameStatus } from '../constants/game-status.enum';
import { Point } from './point.class';
import { Room } from './room.class';
import { SETTINGS } from '../constants/SETTINGS';
import { Serve } from '../interfaces/serve.interface';
import { Dynamic } from '../interfaces/dynamic.interface';
import { DirectionTo } from '../constants/direction-to.enum';
import { Quadrant } from '../constants/quadrant.enum';
import { CollisionType } from '../constants/collision-type.enum';
import { Player } from './player.class';

export class Ball extends Base {
  playerId: string[];

  speed: number = SETTINGS.BALL.SPEED;

  boostCount = 0;

  boostCountMax = 100;

  serve: Serve;

  dynamic: Dynamic = null;

  constructor(leftPlayerId: string, rightPlayerId: string) {
    super();

    this.playerId = [leftPlayerId, rightPlayerId];
    this.serve = setServe(leftPlayerId, -1);
    this.x = SETTINGS.WIDTH / 2;
    this.y = SETTINGS.HEIGHT / 2;
    this.width = SETTINGS.BALL.WIDTH;
    this.height = SETTINGS.BALL.HEIGHT;
    this.color = '#000000';
    this.update = this.setUpdate; // REVIEW super.update = this.setUpdate; 랑 무슨 차이지?
  }

  setUpdate(room: Room): void {
    const playerIds: string[] = Array.from(room.players.keys());

    if (this.serve && this.serve.isOn) {
      playerIds.forEach((playerId) => {
        const player: Player = room.players.get(playerId);
        if (player.id === this.serve.playerId) {
          this.y = player.y;
          if (player.x < SETTINGS.WIDTH / 2) {
            this.x = player.x + this.width / 2 + player.width / 2;
          } else {
            this.x = player.x - this.width / 2 - player.width / 2;
          }
          if (room.status === GameStatus.PLAYING) {
            this.serve.count -= 1;
          }
          if (room.status === GameStatus.PLAYING && this.serve.count < 0) {
            this.serve.isOn = false;
            let newAngle: number;
            if (
              player.x < SETTINGS.WIDTH / 2 &&
              player.y < SETTINGS.HEIGHT / 2
            ) {
              newAngle = -SETTINGS.SERVE_ANGLE;
            } else if (
              player.x < SETTINGS.WIDTH / 2 &&
              player.y > SETTINGS.HEIGHT / 2
            ) {
              newAngle = +SETTINGS.SERVE_ANGLE;
            } else if (
              player.x < SETTINGS.WIDTH / 2 &&
              player.y === SETTINGS.HEIGHT / 2
            ) {
              newAngle = getRandomSign() * SETTINGS.SERVE_ANGLE;
            } else if (
              player.x > SETTINGS.WIDTH / 2 &&
              player.y < SETTINGS.HEIGHT / 2
            ) {
              newAngle = 180 + SETTINGS.SERVE_ANGLE;
            } else if (
              player.x > SETTINGS.WIDTH / 2 &&
              player.y > SETTINGS.HEIGHT / 2
            ) {
              newAngle = 180 - SETTINGS.SERVE_ANGLE;
            } else if (
              player.x > SETTINGS.WIDTH / 2 &&
              player.y === SETTINGS.HEIGHT / 2
            ) {
              newAngle = 180 + getRandomSign() * SETTINGS.SERVE_ANGLE;
            }
            this.dynamic = angleToVelocity(newAngle);
          }
        }
      });
    } else if (room.status === GameStatus.PLAYING) {
      if (this.boostCount > 0) {
        this.boostCount -= 1;
        let boost: number;
        if (this.boostCount > this.boostCountMax / 2) {
          this.color = '#FF0000';
          boost = 2 * this.speed;
        } else {
          this.color = '#000000';
          boost = 2 * this.speed * ((this.boostCount * 2) / this.boostCountMax);
        }
        this.x += this.dynamic.xVel * (this.speed + boost);
        this.y += this.dynamic.yVel * (this.speed + boost);
      } else {
        this.x += this.dynamic.xVel * this.speed;
        this.y += this.dynamic.yVel * this.speed;
      }
      if (this.x <= 0 - this.width * 2) {
        room.players.get(this.playerId[1]).score += 1;
        this.serve = setServe(this.playerId[0]);
        this.color = '#000000';
        this.boostCount = 0;
      }
      if (this.x >= SETTINGS.WIDTH + this.width * 2) {
        room.players.get(this.playerId[0]).score += 1;
        this.serve = setServe(this.playerId[1]);
        this.color = '#000000';
        this.boostCount = 0;
      }
      if (this.y - this.height / 2 <= 0 + SETTINGS.BORDER_WIDTH) {
        this.dynamic = bounce(0, this.dynamic.angle);
      }
      if (this.y + this.height / 2 >= SETTINGS.HEIGHT - SETTINGS.BORDER_WIDTH) {
        this.dynamic = bounce(0, this.dynamic.angle);
      }

      playerIds.forEach((playerId) => {
        const player: Player = room.players.get(playerId);
        const collision = ballCollisionCheck(this, player, this.dynamic.angle);

        switch (collision) {
          case CollisionType.NO_COLLISION:
            break;
          case CollisionType.UP:
            if (getUpDown(this.dynamic.angle) === DirectionTo.DOWN) {
              this.dynamic = bounce(0, this.dynamic.angle);
            } else this.dynamic = angleToVelocity(this.dynamic.angle - 5);
            // console.log("UP");
            break;
          case CollisionType.DOWN:
            if (getUpDown(this.dynamic.angle) === DirectionTo.UP) {
              this.dynamic = bounce(0, this.dynamic.angle);
            } else this.dynamic = angleToVelocity(this.dynamic.angle + 5);
            // console.log("DOWN");
            break;
          case CollisionType.LEFT:
            if (getLeftRight(this.dynamic.angle) === DirectionTo.RIGHT) {
              this.dynamic = bounce(90, this.dynamic.angle);
            }
            // console.log("LEFT");
            break;
          case CollisionType.RIGHT:
            if (getLeftRight(this.dynamic.angle) === DirectionTo.LEFT) {
              this.dynamic = bounce(90, this.dynamic.angle);
            }
            // console.log("RIGHT");
            break;
          case CollisionType.SMASH_TYPE_1:
            this.dynamic = smash(this.dynamic.angle);
            this.boostCount = this.boostCountMax;
            // console.log("SMASH_TYPE_1");
            break;
          case CollisionType.SMASH_TYPE_2:
            this.dynamic = slide(this.dynamic.angle);
            this.boostCount = this.boostCountMax;
            // console.log("SMASH_TYPE_2");
            break;
          case CollisionType.STRAIGHT:
            this.dynamic = straight(this.dynamic.angle);
            // console.log("STRAIGHT");
            break;
          default:
            break;
        }
      });
    }
  }
}

function straight(angle: number) {
  let newAngle = getBouncedAngle(90, angle);
  if (angle === 180 || angle === 0) {
    newAngle = getRandomSign() * SETTINGS.STRAIGHT_ADJUST;
  } else {
    const adj = getRandomSign() * SETTINGS.STRAIGHT_ADJUST;
    switch (getQuadrant(newAngle)) {
      case Quadrant.FIRST:
      case Quadrant.THIRD:
        newAngle += adj;
        break;
      case Quadrant.SECOND:
      case Quadrant.FOURTH:
      default:
        newAngle -= adj;
        break;
    }
  }
  return angleToVelocity(newAngle);
}

function setServe(playerId: string, count?: number) {
  return {
    isOn: true,
    playerId,
    count: count || 100,
  };
}

function bounce(surfaceAngle: number, angle: number) {
  const newAngle = getBouncedAngle(surfaceAngle, angle);
  return angleToVelocity(newAngle);
}

function getBouncedAngle(surfaceAngle: number, angle: number) {
  return surfaceAngle * 2 - angle;
}

function slide(angle: number) {
  let newAngle = getBouncedAngle(90, angle);
  const adj = SETTINGS.EDGE_SHOOT_ANGLE_ADJUST;
  switch (getQuadrant(newAngle)) {
    case Quadrant.FIRST:
    case Quadrant.THIRD:
      newAngle += adj;
      break;
    case Quadrant.SECOND:
    case Quadrant.FOURTH:
    default:
      newAngle -= adj;
      break;
  }
  return angleToVelocity(newAngle);
}

function smash(angle: number) {
  let newAngle = trimAngle(angle + 180);
  const adj = SETTINGS.EDGE_SHOOT_ANGLE_ADJUST;
  switch (getQuadrant(newAngle)) {
    case Quadrant.FIRST:
    case Quadrant.THIRD:
      newAngle -= adj;
      break;
    case Quadrant.SECOND:
    case Quadrant.FOURTH:
    default:
      newAngle += adj;
      break;
  }
  return angleToVelocity(newAngle);
}

function trimAngle(argAngle: number): number {
  let angle: number = argAngle % 360;

  if (angle < 0) {
    angle += 360;
  }

  return angle;
}

function angleToVelocity(angle: number): Dynamic {
  return {
    angle: trimAngle(angle),
    xVel: Math.cos((angle / 180) * Math.PI),
    yVel: -Math.sin((angle / 180) * Math.PI),
  };
}

function ballCollisionCheck(
  ball: Ball,
  player: Player,
  angle: number,
): CollisionType {
  const ballAngle: number = trimAngle(angle);
  const points: Point[] = [
    new Point(ball.x - ball.width / 2, ball.y - ball.height / 2),
    new Point(ball.x + ball.width / 2, ball.y - ball.height / 2),
    new Point(ball.x - ball.width / 2, ball.y + ball.height / 2),
    new Point(ball.x + ball.width / 2, ball.y + ball.height / 2),
  ];
  const collisions: Point[] = [];
  points.forEach((point) => {
    if (pointPlayerCollisionCheck(point, player)) {
      collisions.push(new Point(point.x, point.y));
    }
  });
  let type: CollisionType = CollisionType.NO_COLLISION;
  const sAngle: number = SETTINGS.STRAIGHT_ANGLE;
  const eAngle: number = SETTINGS.EDGE_ANGLE;

  if (collisions.length === 0) {
    return type;
  }
  const p2bAngle: number = getAngle(player, ball);
  const p2bLeftRight: DirectionTo = getLeftRight(p2bAngle);
  const p2bUpDown: DirectionTo = getUpDown(p2bAngle);
  const bLeftRight: DirectionTo = getLeftRight(ballAngle);
  const bUpDown: DirectionTo = getUpDown(ballAngle);
  switch (collisions.length) {
    case 1:
      if (bLeftRight === p2bLeftRight) {
        type =
          p2bUpDown === DirectionTo.UP ? CollisionType.UP : CollisionType.DOWN;
      } else if (
        (ballAngle > eAngle && ballAngle < 180 - eAngle) ||
        (ballAngle > 180 + eAngle && ballAngle < 360 - eAngle)
      ) {
        type =
          bUpDown !== p2bUpDown
            ? CollisionType.SMASH_TYPE_1
            : CollisionType.SMASH_TYPE_2;
      } else
        type =
          p2bLeftRight === DirectionTo.LEFT
            ? CollisionType.LEFT
            : CollisionType.RIGHT;
      break;
    case 2:
      if (collisions[0].x === collisions[1].x) {
        if (
          ballAngle < sAngle ||
          ballAngle > 360 - sAngle ||
          (ballAngle < 180 + sAngle && ballAngle > 180 - sAngle)
        ) {
          type = CollisionType.STRAIGHT;
        } else
          type =
            p2bLeftRight === DirectionTo.LEFT
              ? CollisionType.LEFT
              : CollisionType.RIGHT;
      } else {
        type =
          p2bUpDown === DirectionTo.UP ? CollisionType.UP : CollisionType.DOWN;
      }
      break;
    case 3: // it will never happen
    case 4: // you can put recursive function here if you want to be perfect
    default:
      break;
  }
  return type;
}

function getQuadrant(argAngle: number): Quadrant {
  const angle: number = trimAngle(argAngle);
  if (angle >= 0 && angle < 90) {
    return Quadrant.FIRST;
  }
  if (angle >= 90 && angle < 180) {
    return Quadrant.SECOND;
  }
  if (angle >= 180 && angle < 270) {
    return Quadrant.THIRD;
  }
  return Quadrant.FOURTH;
}

function getLeftRight(argAngle: number): DirectionTo {
  const angle: number = trimAngle(argAngle);
  if (angle < 90 || angle > 270) {
    return DirectionTo.RIGHT;
  }
  return DirectionTo.LEFT;
}

function getUpDown(argAngle: number): DirectionTo {
  const angle: number = trimAngle(argAngle);

  if (angle > 0 && angle < 180) {
    return DirectionTo.UP;
  }

  return DirectionTo.DOWN;
}

function getAngle(player: Player, ball: Ball): number {
  let angle: number =
    (Math.atan(-(ball.y - player.y) / (ball.x - player.x)) / Math.PI) * 180;

  if (player.x > ball.x) {
    angle += Math.sign(angle) * 180;
  }

  if (angle < 0) {
    angle += 360;
  }

  return angle;
}

function getRandomSign(): number {
  return Math.random() < 0.5 ? -1 : 1;
}

function pointPlayerCollisionCheck(point: Point, player: Player): boolean {
  if (
    point.x >= player.x - player.width / 2 &&
    point.x <= player.x + player.width / 2 &&
    point.y >= player.y - player.height / 2 &&
    point.y <= player.y + player.height / 2
  ) {
    return true;
  }
  return false;
}

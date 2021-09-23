import { Base } from './base';
import { GameStatus } from './game-status.enum';
import { Point } from './point';
import { Racket } from './racket';
import { Room } from './room';
import { SETTINGS } from './SETTINGS';

enum CollisionType {
  NO_COLLISION = -1,
  UP,
  RIGHT,
  DOWN,
  LEFT,
  SMASH_TYPE_1,
  SMASH_TYPE_2,
  STRAIGHT,
}

enum Quadrant {
  FIRST = 1,
  SECOND,
  THIRD,
  FOURTH,
}

enum DIRECTION_TO {
  RIGHT = 'RIGHT',
  LEFT = 'LEFT',
  UP = 'UP',
  DOWN = 'DOWN',
}

interface Serve {
  isOn: boolean;
  player: string;
  count: number;
}

interface Dynamic {
  angle: number;
  xVel: number;
  yVel: number;
}

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
    this.racket = {
      x: SETTINGS.WIDTH / 2,
      y: SETTINGS.HEIGHT / 2,
      width: SETTINGS.BALL.WIDTH,
      height: SETTINGS.BALL.HEIGHT,
      color: '#000000',
    };
    super.update = this.setUpdate; // REVIEW this.update = this.setUpdate; 랑 무슨 차이지?
  }

  setUpdate(room: Room): void {
    const ball: Racket = this.racket;
    const players: string[] = Array.from(room.players.keys());
    let playerStat: Racket;
    if (this.serve && this.serve.isOn) {
      players.forEach((key) => {
        const object = room.players[key];
        if (object.id === this.serve.player) {
          playerStat = room.players[object.id].object;
          ball.y = playerStat.y;
          if (playerStat.x < SETTINGS.WIDTH / 2) {
            ball.x = playerStat.x + ball.width / 2 + playerStat.width / 2;
          } else {
            ball.x = playerStat.x - ball.width / 2 - playerStat.width / 2;
          }
          if (room.status === GameStatus.PLAYING) {
            this.serve.count -= 1;
          }
          if (room.status === GameStatus.PLAYING && this.serve.count < 0) {
            this.serve.isOn = false;
            let newAngle: number;
            if (
              playerStat.x < SETTINGS.WIDTH / 2 &&
              playerStat.y < SETTINGS.HEIGHT / 2
            ) {
              newAngle = -SETTINGS.SERVE_ANGLE;
            } else if (
              playerStat.x < SETTINGS.WIDTH / 2 &&
              playerStat.y > SETTINGS.HEIGHT / 2
            ) {
              newAngle = +SETTINGS.SERVE_ANGLE;
            } else if (
              playerStat.x < SETTINGS.WIDTH / 2 &&
              playerStat.y === SETTINGS.HEIGHT / 2
            ) {
              newAngle = getRandomSign() * SETTINGS.SERVE_ANGLE;
            } else if (
              playerStat.x > SETTINGS.WIDTH / 2 &&
              playerStat.y < SETTINGS.HEIGHT / 2
            ) {
              newAngle = 180 + SETTINGS.SERVE_ANGLE;
            } else if (
              playerStat.x > SETTINGS.WIDTH / 2 &&
              playerStat.y > SETTINGS.HEIGHT / 2
            ) {
              newAngle = 180 - SETTINGS.SERVE_ANGLE;
            } else if (
              playerStat.x > SETTINGS.WIDTH / 2 &&
              playerStat.y === SETTINGS.HEIGHT / 2
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
          this.racket.color = '#FF0000';
          boost = 2 * this.speed;
        } else {
          this.racket.color = '#000000';
          boost = 2 * this.speed * ((this.boostCount * 2) / this.boostCountMax);
        }
        ball.x += this.dynamic.xVel * (this.speed + boost);
        ball.y += this.dynamic.yVel * (this.speed + boost);
      } else {
        ball.x += this.dynamic.xVel * this.speed;
        ball.y += this.dynamic.yVel * this.speed;
      }
      if (ball.x <= 0 - ball.width * 2) {
        room.players[this.playerId[1]].score += 1;
        this.serve = setServe(this.playerId[0]);
        ball.color = '#000000';
        this.boostCount = 0;
      }
      if (ball.x >= SETTINGS.WIDTH + ball.width * 2) {
        room.players[this.playerId[0]].score += 1;
        this.serve = setServe(this.playerId[1]);
        ball.color = '#000000';
        this.boostCount = 0;
      }
      if (ball.y - ball.height / 2 <= 0 + SETTINGS.BORDER_WIDTH) {
        this.dynamic = bounce(0, this.dynamic.angle);
      }
      if (ball.y + ball.height / 2 >= SETTINGS.HEIGHT - SETTINGS.BORDER_WIDTH) {
        this.dynamic = bounce(0, this.dynamic.angle);
      }

      players.forEach((key) => {
        playerStat = room.players[key].object;
        const collision = ballCollisionCheck(
          ball,
          playerStat,
          this.dynamic.angle,
        );

        switch (collision) {
          case CollisionType.NO_COLLISION:
            break;
          case CollisionType.UP:
            if (getUpDown(this.dynamic.angle) === DIRECTION_TO.DOWN) {
              this.dynamic = bounce(0, this.dynamic.angle);
            } else this.dynamic = angleToVelocity(this.dynamic.angle - 5);
            // console.log("UP");
            break;
          case CollisionType.DOWN:
            if (getUpDown(this.dynamic.angle) === DIRECTION_TO.UP) {
              this.dynamic = bounce(0, this.dynamic.angle);
            } else this.dynamic = angleToVelocity(this.dynamic.angle + 5);
            // console.log("DOWN");
            break;
          case CollisionType.LEFT:
            if (getLeftRight(this.dynamic.angle) === DIRECTION_TO.RIGHT) {
              this.dynamic = bounce(90, this.dynamic.angle);
            }
            // console.log("LEFT");
            break;
          case CollisionType.RIGHT:
            if (getLeftRight(this.dynamic.angle) === DIRECTION_TO.LEFT) {
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
    player: playerId,
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
  ballStat: Racket,
  playerStat: Racket,
  angle: number,
): CollisionType {
  const ballAngle: number = trimAngle(angle);
  const points: Point[] = [
    new Point(
      ballStat.x - ballStat.width / 2,
      ballStat.y - ballStat.height / 2,
    ),
    new Point(
      ballStat.x + ballStat.width / 2,
      ballStat.y - ballStat.height / 2,
    ),
    new Point(
      ballStat.x - ballStat.width / 2,
      ballStat.y + ballStat.height / 2,
    ),
    new Point(
      ballStat.x + ballStat.width / 2,
      ballStat.y + ballStat.height / 2,
    ),
  ];
  const collisions: Point[] = [];
  points.forEach((point) => {
    if (pointSquareCollisionCheck(point.x, point.y, playerStat)) {
      collisions.push(new Point(point.x, point.y));
    }
  });
  let type: CollisionType = CollisionType.NO_COLLISION;
  const sAngle: number = SETTINGS.STRAIGHT_ANGLE;
  const eAngle: number = SETTINGS.EDGE_ANGLE;

  if (collisions.length === 0) {
    return type;
  }
  const p2bAngle: number = getAngle(playerStat, ballStat);
  const p2bLeftRight: DIRECTION_TO = getLeftRight(p2bAngle);
  const p2bUpDown: DIRECTION_TO = getUpDown(p2bAngle);
  const bLeftRight: DIRECTION_TO = getLeftRight(ballAngle);
  const bUpDown: DIRECTION_TO = getUpDown(ballAngle);
  switch (collisions.length) {
    case 1:
      if (bLeftRight === p2bLeftRight) {
        type =
          p2bUpDown === DIRECTION_TO.UP ? CollisionType.UP : CollisionType.DOWN;
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
          p2bLeftRight === DIRECTION_TO.LEFT
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
            p2bLeftRight === DIRECTION_TO.LEFT
              ? CollisionType.LEFT
              : CollisionType.RIGHT;
      } else {
        type =
          p2bUpDown === DIRECTION_TO.UP ? CollisionType.UP : CollisionType.DOWN;
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

function getLeftRight(argAngle: number): DIRECTION_TO {
  const angle: number = trimAngle(argAngle);
  if (angle < 90 || angle > 270) {
    return DIRECTION_TO.RIGHT;
  }
  return DIRECTION_TO.LEFT;
}

function getUpDown(argAngle: number): DIRECTION_TO {
  const angle: number = trimAngle(argAngle);

  if (angle > 0 && angle < 180) {
    return DIRECTION_TO.UP;
  }

  return DIRECTION_TO.DOWN;
}

function getAngle(racket: Racket, end: Point): number {
  let angle: number =
    (Math.atan(-(end.y - racket.y) / (end.x - racket.x)) / Math.PI) * 180;

  if (racket.x > end.x) {
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

function pointSquareCollisionCheck(
  x: number,
  y: number,
  racket: Racket,
): boolean {
  if (
    x >= racket.x - racket.width / 2 &&
    x <= racket.x + racket.width / 2 &&
    y >= racket.y - racket.height / 2 &&
    y <= racket.y + racket.height / 2
  ) {
    return true;
  }
  return false;
}

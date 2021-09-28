import { Countdown } from '../classes/countdown.class';
import { Player } from '../classes/player.class';
import { Ball } from '../classes/ball.class';

export class EmitDataDto {
  countdown: Countdown;
  player: Player[];
  ball: Ball;
}

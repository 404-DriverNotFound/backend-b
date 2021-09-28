import { Server, Socket } from 'socket.io';
import { Ball } from './ball.class';
import { Countdown } from './countdown.class';
import { GameStatus } from '../constants/game-status.enum';
import { Player } from './player.class';
import { PlayerPosition } from '../constants/player-position.enum';
import { RoomManagerService } from '../room-manager.service';
import { SETTINGS } from '../constants/SETTINGS';

export class Room {
  roomManagerService: RoomManagerService;

  server: Server;

  id: string;

  status: GameStatus = GameStatus.NONE;

  sockets: Socket[];

  players: Map<string, Player> = new Map<string, Player>();

  countdown: Countdown = null;

  gameOverDelay = 3;

  ball: Ball;

  loop: () => void = null;

  constructor(
    roomManagerService: RoomManagerService,
    server: Server,
    id: string,
    socket0: Socket,
    socket1: Socket,
  ) {
    this.roomManagerService = roomManagerService;
    this.server = server;
    this.id = id;
    this.sockets = [socket0, socket1];
    this.players.set(socket0.id, new Player(socket0.id, PlayerPosition.LEFT));
    this.players.set(socket1.id, new Player(socket1.id, PlayerPosition.RIGHT));
    this.ball = new Ball(socket0.id, socket1.id);
  }

  playInit(): void {
    this.status = GameStatus.COUNTDOWN;
    this.loop = this.playLoop;
    this.countdown = new Countdown(3);
    this.countdown.action = () => {
      delete this.countdown;
      this.status = GameStatus.PLAYING;
    };
    this.server.to(this.id).emit('playing');
  }

  playLoop(): void {
    const data = this.getEmitData();
    this.server.to(this.id).emit('update', data);
    if (
      this.status === GameStatus.PLAYING &&
      (this.players.get(this.sockets[0].id).score >= SETTINGS.GOAL ||
        this.players.get(this.sockets[1].id).score >= SETTINGS.GOAL)
    ) {
      this.status = GameStatus.GAMEOVER;
      this.gameOverDelay = 3;
    }
    if (this.status === GameStatus.GAMEOVER && this.gameOverDelay < 0) {
      if (
        this.players.get(this.sockets[0].id).score >
        this.players.get(this.sockets[1].id).score
      ) {
        this.roomManagerService.gameOverRoom(
          this.server,
          this.id,
          this.sockets[0].id,
        );
      } else {
        this.roomManagerService.gameOverRoom(
          this.server,
          this.id,
          this.sockets[1].id,
        );
      }
    }
  }

  readyInit(): void {
    this.status = GameStatus.READY;
    this.loop = this.readyLoop;
    this.countdown = new Countdown(10);
    this.countdown.action = () => {
      delete this.countdown;
      this.roomManagerService.destroyRoom(this.server, this.id);
    };
  }

  readyLoop(): void {
    const player0ready: boolean = this.players.get(this.sockets[0].id).ready;
    const player1ready: boolean = this.players.get(this.sockets[1].id).ready;
    if (player0ready && player1ready) {
      this.playInit();
    }
    const data = this.getEmitData();
    this.server.to(this.id).emit('update', data);
  }

  getEmitData(): Map<string, Countdown | Player | Ball> {
    const data = new Map<string, Countdown | Player | Ball>();

    this.countdown?.update();
    data['countdown'] = this.countdown;

    for (let i = 0; i < 2; i++) {
      const player: Player = this.players.get(this.sockets[i].id);
      player.update(this);
      data.set('player' + i, player);
    }

    this.ball.update(this);
    data.set('ball', this.ball);
    return data;
  }
}

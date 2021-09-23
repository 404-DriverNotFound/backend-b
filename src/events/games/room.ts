import { Server, Socket } from 'socket.io';
import { Ball } from './ball';
import { Countdown } from './Countdown';
import { GameStatus } from './game-status.enum';
import { Player } from './player';
import { PlayerPosition } from './player-position.enum';
import { RoomManagerService } from './room-manager.service';
import { SETTINGS } from './SETTINGS';

export class Room {
  roomManagerService: RoomManagerService;

  server: Server;

  id: string;

  status: GameStatus = GameStatus.NONE;

  sockets: Socket[]; // FIXME 룸에 속해있는 소켓목록을 알 수 있다면 수정해야함.

  players: Map<string, Player>;

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
    this.players[socket0.id] = new Player(socket0.id, PlayerPosition.LEFT);
    this.players[socket1.id] = new Player(socket1.id, PlayerPosition.RIGHT);
    //this.ball = new Ball(socket0.id, socket1.id);
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
    const statuses = this.getStats();
    this.server.to(this.id).emit('update', statuses);
    if (
      this.status === GameStatus.PLAYING &&
      (this.players[this.sockets[0].id].score >= SETTINGS.GOAL ||
        this.players[this.sockets[1].id].score >= SETTINGS.GOAL)
    ) {
      this.status = GameStatus.GAMEOVER;
      this.gameOverDelay = 3;
    }
    if (this.status === GameStatus.GAMEOVER && this.gameOverDelay < 0) {
      if (
        this.players[this.sockets[0].id].score >
        this.players[this.sockets[1].id].score
      ) {
        this.roomManagerService.gameOverRoom(this.id, this.sockets[0].id);
      } else {
        this.roomManagerService.gameOverRoom(this.id, this.sockets[1].id);
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
    const player0ready = this.players[this.players[0].id].ready;
    const player1ready = this.players[this.players[1].id].ready;
    if (player0ready && player1ready) {
      this.playInit();
    }
    const statuses = this.getStats();
    this.server.to(this.id).emit('update', statuses);
  }

  getStats(): any {
    //  const statuses: EmitStatusType[] = [];
    //  const keys = Object.keys(this.players);
    //  keys.forEach((key) => {
    //    const object = this.players[key];
    //    object.update(this);
    //    statuses.push({ status: object.status, object: object.object });
    //  });
    //  this.ball.update(this);
    //  statuses.push({ status: this.ball.status, object: this.ball.object });
    //  return statuses;
  }
}
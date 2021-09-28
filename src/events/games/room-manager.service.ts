import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Server, Socket } from 'socket.io';
import { Match } from 'src/matches/match.entity';
import { MatchesRepository } from 'src/matches/matches.repository';
import { UserStatus } from 'src/users/constants/user-status.enum';
import { User } from 'src/users/entities/user.entity';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { Room } from './classes/room.class';
import { PlayerPosition } from './constants/player-position.enum';
import { CLIENT_SETTINGS } from './constants/SETTINGS';

@Injectable()
export class RoomManagerService {
  constructor(
    @InjectRepository(MatchesRepository)
    private readonly matchesRepository: MatchesRepository,
    @InjectRepository(UsersRepository)
    private readonly usersRepository: UsersRepository,
  ) {}

  // REVIEW map으로 수정함이 적절한가?
  rooms: Map<string, Room> = new Map<string, Room>();

  roomIds: Map<string, string> = new Map<string, string>();

  async createRoom(
    server: Server,
    socket0: Socket,
    socket1: Socket,
  ): Promise<void> {
    // TODO REVIEW match : user1 user2 를 user0 user1로 바꿔야할까?
    const user1Id: string = socket0.handshake.query.userId as string;
    const user1: User = await this.usersRepository.findOne({ id: user1Id });
    if (!user1) {
      return;
    }
    user1.status = UserStatus.IN_GAME;

    const user2Id: string = socket0.handshake.query.userId as string;
    const user2: User = await this.usersRepository.findOne({ id: user2Id });
    if (!user2) {
      return;
    }
    user2.status = UserStatus.IN_GAME;
    // REVIEW 회원 접속상태 온라인에서 게임으로 바꿔야함.
    await this.usersRepository.save([user1, user2]);

    const match: Match = this.matchesRepository.create({ user1, user2 });
    await this.matchesRepository.save(match);

    const roomId: string = match.id; // REVIEW 나중에 match id로
    const room: Room = new Room(this, server, roomId, socket0, socket1);
    socket0.join(roomId);
    socket1.join(roomId);
    this.rooms.set(roomId, room);
    this.roomIds.set(socket0.id, roomId);
    this.roomIds.set(socket1.id, roomId);
    room.readyInit();
    server.to(socket0.id).emit('ready', PlayerPosition.LEFT, CLIENT_SETTINGS);
    server.to(socket1.id).emit('ready', PlayerPosition.RIGHT, CLIENT_SETTINGS);
    console.log('Room Created :', roomId);
  }

  async destroyRoom(server: Server, roomId: string): Promise<void> {
    const room: Room = this.rooms.get(roomId);

    room.sockets.forEach(async (socket: Socket) => {
      const message: string =
        !room.players.get(socket.id).ready && !room.countdown
          ? 'YOU ARE NOT PREPARED'
          : null;
      this.roomIds.delete(socket.id);
      server.to(socket.id).emit('destroy', message);
      socket.leave(roomId);
      // REVIEW 회원 접속상태 게임에서 온라인으로 바꿔야함.
      const userId: string = socket.handshake.query.userId as string;
      await this.usersRepository.update(userId, { status: UserStatus.ONLINE });
    });

    this.rooms.delete(roomId);
    await this.matchesRepository.delete(roomId);
  }

  async gameOverRoom(
    server: Server,
    roomId: string,
    winnerSocketId: string,
  ): Promise<void> {
    const room: Room = this.rooms.get(roomId);
    let winner: User;
    let loser: User;

    room.sockets.forEach(async (socket: Socket) => {
      // REVIEW 회원 접속상태 게임에서 온라인으로 바꿔야함.
      const userId: string = socket.handshake.query.userId as string;
      const user: User = await this.usersRepository.findOne(userId);
      await this.usersRepository.update(userId, { status: UserStatus.ONLINE });
      if (socket.id === winnerSocketId) {
        winner = user;
        await this.usersRepository.update(winner.id, {
          score: winner.score + 10,
        });
      } else {
        loser = user;
        await this.usersRepository.update(loser.id, {
          score: loser.score - 10,
        });
      }
      const message: string =
        socket.id === winnerSocketId ? 'YOU WIN!' : 'YOU LOSE!';
      this.roomIds.delete(socket.id);
      server.to(socket.id).emit('destroy', message);
      socket.leave(roomId);
    });

    this.rooms.delete(roomId);
    await this.matchesRepository.update(roomId, { winner, loser });
  }
}

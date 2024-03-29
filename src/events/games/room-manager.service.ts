import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Server, Socket } from 'socket.io';
import { MatchStatus } from 'src/matches/constants/match-status.enum';
import { Match } from 'src/matches/match.entity';
import { MatchesRepository } from 'src/matches/matches.repository';
import { UserStatus } from 'src/users/constants/user-status.enum';
import { User } from 'src/users/entities/user.entity';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { Room } from './classes/room.class';
import { PlayerPosition } from './constants/player-position.enum';
import { CLIENT_SETTINGS } from './constants/SETTINGS';
import { MatchType } from '../../matches/constants/match-type.enum';
import { MatchGameMode } from '../../matches/constants/match-game-mode.enum';
import { UsersService } from 'src/users/users.service';
import { AchievementName } from 'src/users/constants/achievement-name.enum';
import { plainToClass } from 'class-transformer';

@Injectable()
export class RoomManagerService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(MatchesRepository)
    private readonly matchesRepository: MatchesRepository,
    @InjectRepository(UsersRepository)
    private readonly usersRepository: UsersRepository,
  ) {}

  rooms: Map<string, Room> = new Map<string, Room>();

  roomIds: Map<string, string> = new Map<string, string>();

  async createRoom(
    server: Server,
    socket0: Socket,
    socket1: Socket,
    type: MatchType,
    mode: MatchGameMode,
  ): Promise<void> {
    const user1Id: string = socket0.handshake.query.userId as string;
    const user1: User = await this.usersRepository.findOne({ id: user1Id });
    if (!user1) {
      return;
    }
    user1.status = UserStatus.IN_GAME;

    const user2Id: string = socket1.handshake.query.userId as string;
    const user2: User = await this.usersRepository.findOne({ id: user2Id });
    if (!user2) {
      return;
    }
    user2.status = UserStatus.IN_GAME;
    // NOTE 회원 접속상태 온라인에서 게임으로 바꿔야함.
    await this.usersRepository.save([user1, user2]);

    const match: Match = this.matchesRepository.create({
      user1,
      user2,
      type,
      mode,
    });
    await this.matchesRepository.save(match);

    const roomId: string = match.id;
    const room: Room = new Room(
      this,
      server,
      roomId,
      socket0,
      socket1,
      type,
      mode,
    );
    socket0.join(roomId);
    socket1.join(roomId);
    this.rooms.set(roomId, room);
    this.roomIds.set(socket0.id, roomId);
    this.roomIds.set(socket1.id, roomId);
    room.readyInit();

    const transformedUser1: User = plainToClass(User, user1);
    const transformedUser2: User = plainToClass(User, user2);

    server.to(socket0.id).emit('ready', {
      position: PlayerPosition.LEFT,
      user1: transformedUser1,
      user2: transformedUser2,
      setting: CLIENT_SETTINGS,
    });
    server.to(socket1.id).emit('ready', {
      position: PlayerPosition.RIGHT,
      user1: transformedUser1,
      user2: transformedUser2,
      setting: CLIENT_SETTINGS,
    });

    console.log('Room Created :', roomId);
  }

  async destroyRoom(server: Server, roomId: string): Promise<void> {
    const room: Room = this.rooms.get(roomId);

    const promises: Promise<void>[] = room.sockets.map(
      async (socket: Socket) => {
        // NOTE 회원 접속상태 게임에서 온라인으로 바꿔야함.
        const userId: string = socket.handshake.query.userId as string;
        await this.usersRepository.update(userId, {
          status: UserStatus.ONLINE,
        });
        const message: string =
          !room.players.get(socket.id).ready && !room.countdown
            ? 'YOU ARE NOT PREPARED'
            : null;
        this.roomIds.delete(socket.id);
        server.to(socket.id).emit('destroy', { message });
        socket.leave(roomId);
      },
    );
    await Promise.all(promises);
    server.to(roomId).emit('destroy', { mesage: 'Game canceled!' });
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
    const promises: Promise<void>[] = room.sockets.map(
      async (socket: Socket) => {
        // NOTE 회원 접속상태 게임에서 온라인으로 바꿔야함.
        const userId: string = socket.handshake.query.userId as string;
        const user: User = await this.usersRepository.findOne(userId);
        if (socket.id === winnerSocketId) {
          winner = user;
          winner.status = UserStatus.ONLINE;
          if (room.type === MatchType.LADDER) {
            winner.score += 10;
            winner.win += 1;
          }
          await this.usersRepository.update(winner.id, winner);
        } else {
          loser = user;
          loser.status = UserStatus.ONLINE;
          if (room.type === MatchType.LADDER) {
            loser.score -= 10;
            loser.lose += 1;
          }
          await this.usersRepository.update(loser.id, loser);
        }
        const message: string =
          socket.id === winnerSocketId ? 'YOU WIN!' : 'YOU LOSE!';
        this.roomIds.delete(socket.id);
        server.to(socket.id).emit('destroy', { message });
        socket.leave(roomId);
      },
    );
    await Promise.all(promises);
    server
      .to(roomId)
      .emit('destroy', { message: `Game ended! Winner is ${winner.name}.` });
    this.rooms.delete(roomId);
    await this.matchesRepository.update(roomId, {
      status: MatchStatus.DONE,
      winner,
      loser,
    });

    if (winner.win === 1) {
      if (winner.lose === 0) {
        this.usersService.createUserAchievement(
          winner,
          AchievementName.FIRST_GAME,
        );
      }

      this.usersService.createUserAchievement(
        winner,
        AchievementName.FIRST_WIN,
      );
    }

    if (loser.lose === 1) {
      if (loser.win === 0) {
        this.usersService.createUserAchievement(
          loser,
          AchievementName.FIRST_GAME,
        );
      }

      this.usersService.createUserAchievement(
        loser,
        AchievementName.FIRST_LOSE,
      );
    }
  }
}

import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RoomManagerService } from './room-manager.service';
import { MatchType } from '../../matches/constants/match-type.enum';
import { MatchGameMode } from '../../matches/constants/match-game-mode.enum';

@Injectable()
export class LobbyManagerService {
  ladderClassic: Set<Socket> = new Set<Socket>();
  ladderReverse: Set<Socket> = new Set<Socket>();
  ladderHard: Set<Socket> = new Set<Socket>();
  exhibitionClassic: Set<Socket> = new Set<Socket>();
  exhibitionReverse: Set<Socket> = new Set<Socket>();
  exhibitionHard: Set<Socket> = new Set<Socket>();
  dispatching = false;

  // NOTE push is add
  // NOTE kick is delete
  // NOTE clean is clear

  constructor(private readonly roomManagerService: RoomManagerService) {}

  queue(type: MatchType, mode: MatchGameMode): Set<Socket> {
    if (type === MatchType.LADDER) {
      if (mode === MatchGameMode.CLASSIC) {
        return this.ladderClassic;
      } else if (mode === MatchGameMode.REVERSE) {
        return this.ladderReverse;
      } else {
        return this.ladderHard;
      }
    } else {
      if (mode === MatchGameMode.CLASSIC) {
        return this.exhibitionClassic;
      } else if (mode === MatchGameMode.REVERSE) {
        return this.exhibitionReverse;
      } else {
        return this.exhibitionHard;
      }
    }
  }

  cleanDisconnectedSocket(set: Set<Socket>): void {
    set.forEach((socket: Socket) => {
      if (socket.disconnected) {
        set.delete(socket);
      }
    });
  }

  dispatch(
    server: Server,
    set: Set<Socket>,
    type: MatchType,
    mode: MatchGameMode,
  ): void {
    if (this.dispatching) {
      return;
    }
    this.dispatching = true;
    this.cleanDisconnectedSocket(set);
    while (set.size > 1) {
      const socket0: Socket = [...set][0];
      set.delete(socket0);

      const socket1: Socket = [...set][0];
      if (socket0.handshake.query.userId === socket1.handshake.query.userId) {
        server.to(socket0.id).emit('duplicated');
        continue;
      }
      set.delete(socket1);

      this.roomManagerService.createRoom(server, socket0, socket1, type, mode);
    }
    this.dispatching = false;
  }
}

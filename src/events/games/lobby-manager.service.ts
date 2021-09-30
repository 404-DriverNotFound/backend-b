import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RoomManagerService } from './room-manager.service';
import { MatchType } from '../../matches/constants/match-type.enum';
import { MatchGameMode } from '../../matches/constants/match-game-mode.enum';

//import { RoomManagerService } from './room-manager.service';

@Injectable()
export class LobbyManagerService {
  lobby: Set<Socket> = new Set<Socket>(); // REVIEW 모드별 로비..?
  ladder_classic: Set<Socket> = new Set<Socket>();
  ladder_reverse: Set<Socket> = new Set<Socket>();
  ladder_hard: Set<Socket> = new Set<Socket>();
  exhibition_classic: Set<Socket> = new Set<Socket>();
  exhibition_reverse: Set<Socket> = new Set<Socket>();
  exhibition_hard: Set<Socket> = new Set<Socket>();
  dispatching = false;

  // NOTE push is add
  // NOTE kick is delete
  // NOTE clean is clear

  constructor(private readonly roomManagerService: RoomManagerService) {}

  queue(client: Socket, type: MatchType, mode: MatchGameMode): Set<Socket> {
    if (type === MatchType.LADDER) {
      if (mode === MatchGameMode.CLASSIC) {
        this.ladder_classic.add(client);
        return this.ladder_classic;
      } else if (mode === MatchGameMode.REVERSE) {
        this.ladder_reverse.add(client);
        return this.ladder_reverse;
      } else {
        this.ladder_hard.add(client);
        return this.ladder_hard;
      }
    } else {
      if (mode === MatchGameMode.CLASSIC) {
        this.exhibition_classic.add(client);
        return this.exhibition_classic;
      } else if (mode === MatchGameMode.REVERSE) {
        this.exhibition_reverse.add(client);
        return this.exhibition_reverse;
      } else {
        this.exhibition_hard.add(client);
        return this.exhibition_hard;
      }
    }
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
    while (set.size > 1) {
      const socket0: Socket = [...set][0];
      set.delete(socket0);

      const socket1: Socket = [...set][0];
      set.delete(socket1);

      this.roomManagerService.createRoom(server, socket0, socket1, type, mode);
    }
    this.dispatching = false;
  }
}

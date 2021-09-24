import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RoomManagerService } from './room-manager.service';
//import { RoomManagerService } from './room-manager.service';

@Injectable()
export class LobbyManagerService {
  lobby: Set<Socket> = new Set<Socket>(); // REVIEW 모드별 로비..?

  dispatching = false;
  // NOTE PUSH is add
  // NOTE kick is delete
  // NOTE clean is clear

  constructor(private readonly roomManagerService: RoomManagerService) {}

  dispatch(server: Server): void {
    // REVIEW dispatching이 true인 상태가 존재할까???
    if (this.dispatching) {
      return;
    }
    this.dispatching = true; // FIXME 존재 이유..?
    while (this.lobby.size > 1) {
      const socket0: Socket = [...this.lobby][0];
      this.lobby.delete(socket0);

      const socket1: Socket = [...this.lobby][0];
      this.lobby.delete(socket1);

      this.roomManagerService.createRoom(server, socket0, socket1);
    }
    this.dispatching = false;
  }
}

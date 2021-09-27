import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Room } from './classes/room.class';
import { PlayerPosition } from './constants/player-position.enum';
import { CLIENT_SETTINGS } from './constants/SETTINGS';

@Injectable()
export class RoomManagerService {
  // REVIEW map으로 수정함이 적절한가?
  rooms: Map<string, Room> = new Map<string, Room>();

  roomIds: Map<string, string> = new Map<string, string>();

  createRoom(server: Server, socket0: Socket, socket1: Socket): void {
    const roomId: string = socket0.id + socket1.id; //FIXME 나중에 match id로
    const room: Room = new Room(this, server, roomId, socket0, socket1);
    socket0.join(roomId);
    socket1.join(roomId);
    this.rooms[roomId] = room;
    this.roomIds[socket0.id] = roomId;
    this.roomIds[socket1.id] = roomId;
    room.readyInit();
    server.to(socket0.id).emit('ready', PlayerPosition.LEFT, CLIENT_SETTINGS);
    server.to(socket1.id).emit('ready', PlayerPosition.RIGHT, CLIENT_SETTINGS);
    console.log('Room Created :', roomId);
  }

  destroyRoom(server: Server, roomId: string): void {
    const room: Room = this.rooms[roomId];

    room.sockets.forEach((socket: Socket) => {
      const message: string =
        !room.players[socket.id].ready && !room.countdown
          ? 'YOU ARE NOT PREPARED'
          : null;
      delete this.roomIds[socket.id];
      server.to(socket.id).emit('destroy', message);
    });

    delete this.rooms[roomId];
  }

  gameOverRoom(server: Server, roomId: string, winnerSocketId: string) {
    const room: Room = this.rooms[roomId];

    room.sockets.forEach((socket: Socket) => {
      const message: string =
        socket.id === winnerSocketId ? 'YOU WIN!' : 'YOU LOSE!';
      delete this.roomIds[socket.id];
      server.to(socket.id).emit('destroy', message);
    });

    delete this.rooms[roomId];
  }
}

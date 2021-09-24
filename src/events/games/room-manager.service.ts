import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Room } from './room';

@Injectable()
export class RoomManagerService {
  // NOTE key: roomId, value: Room object
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
    //room.readyInit();
    server.to(socket0.id).emit('ready', 'left');
    server.to(socket1.id).emit('ready', 'right');
    console.log('Room Created :', roomId);
  }

  destroyRoom(server: Server, roomId: string): void {
    const room: Room = this.rooms[roomId];
    // FIXME
    //room.sockets.forEach((socket) => {
    //  const message = (!room.players[socket.id].ready && !room.players.countdown) ? 'YOU ARE NOT PREPARED' : null;
    //  delete this.roomIndex[socket.id];
    //  this.io.to(socket.id).emit('destroy', message);
    //});

    //const clients = server.sockets.adapter.rooms.get(roomId);
    // TODO loop clients
    delete this.rooms[roomId];
  }

  gameOverRoom(roomId: string, winnerSocketId: string) {
    const room: Room = this.rooms[roomId];
    // FIXME
    //room.sockets.forEach((socket) => {
    //  const message = socket.id === winnerId ? 'YOU WIN!' : 'YOU LOSE!';
    //  delete this.roomIndex[socket.id];
    //  this.io.to(socket.id).emit('destroy', message);
    //});

    //const clients = server.sockets.adapter.rooms.get(roomId);
    // TODO loop clients
    delete this.rooms[roomId];
  }
}

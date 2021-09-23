import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { RoomManagerService } from './room-manager.service';

@Injectable()
export class GameManagerService {
  constructor(private readonly roomManagerService: RoomManagerService) {}

  @Interval(10)
  update() {
    const roomIds: string[] = Array.from(this.roomManagerService.rooms.keys());

    roomIds.forEach((roomId: string) =>
      this.roomManagerService.rooms[roomId].loop(),
    );
  }
}

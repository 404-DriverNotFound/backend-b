import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { RoomManagerService } from './room-manager.service';

@Injectable()
export class GameManagerService {
  constructor(private readonly roomManagerService: RoomManagerService) {}

  @Interval(10)
  update() {
    this.roomManagerService.rooms.forEach((room) => room.loop());
  }
}

import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { RoomManagerService } from './room-manager.service';

@Injectable()
export class GameManagerService {
  constructor(private readonly roomManagerService: RoomManagerService) {}

  @Interval(10)
  update() {
    //const keys = Object.keys(this.roomManager.rooms); // FIXME map.keys()
    //keys.forEach((key) => {
    //  this.roomManager.rooms[key].loop();
    //});
  }
}

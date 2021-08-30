import { Injectable } from '@nestjs/common';
import { FriendshipStatus } from './friendships/friendship-status.enum';
import { FriendshipsService } from './friendships/friendships.service';
import { User } from './users/user.entity';
import { UsersService } from './users/users.service';

@Injectable()
export class AppService {
  constructor(
    private readonly usersService: UsersService,
    private readonly friendshipsService: FriendshipsService,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async seed(requester: User) {
    const charSet =
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let i = 0; i < 200; i++) {
      let name = '';
      const nameLength: number = Math.floor(Math.random() * 9) + 3;

      for (let j = 0; j < nameLength; j++) {
        name += charSet[Math.floor(Math.random() * charSet.length)];
      }
      const user: User = await this.usersService.createUser(
        {
          ftId: Math.floor(Math.random() * 10 ** 5),
          name,
          enable2FA: 'false',
        },
        undefined,
      );
      switch (user.ftId % 5) {
        case 0:
          await this.friendshipsService.createFriendship(requester, user.name);
          break;

        case 1:
          await this.friendshipsService.createFriendship(user, requester.name);
          break;

        case 2:
          await this.friendshipsService.createFriendship(requester, user.name);
          await this.friendshipsService.updateFriendshipStatus(
            requester.name,
            user,
            FriendshipStatus.ACCEPTED,
          );
          break;

        case 3:
          await this.friendshipsService.createBlack(requester, user.name);
          break;

        case 4:
          await this.friendshipsService.createBlack(user, requester.name);
          break;
      }
    }
  }
}

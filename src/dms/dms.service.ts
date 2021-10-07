import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { EventsGateway } from 'src/events/events.gateway';
import { FriendshipStatus } from 'src/friendships/friendship-status.enum';
import { Friendship } from 'src/friendships/friendship.entity';
import { FriendshipsService } from 'src/friendships/friendships.service';
import { User } from 'src/users/entities/user.entity';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { UsersService } from 'src/users/users.service';
import { Dm } from './dm.entity';
import { DmsRepository } from './dms.repository';

@Injectable()
export class DmsService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(DmsRepository)
    private readonly dmsRepository: DmsRepository,
    @InjectRepository(UsersRepository)
    private readonly usersRepository: UsersRepository,
    private readonly friendshipsService: FriendshipsService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async createDM(sender: User, name?: string, content?: string): Promise<Dm> {
    if (sender.name === name) {
      throw new ConflictException(['Cannot send dm to you']);
    }

    const frienship: Friendship =
      await this.friendshipsService.getFriendshipByName(sender, name, false);

    if (frienship?.status === FriendshipStatus.BLOCKED) {
      throw frienship.requester.id === sender.id
        ? new ForbiddenException([`You are blocking ${name}.`])
        : new ForbiddenException([`You are blocked by ${name}.`]);
    }

    const receiver: User = await this.usersService.getUserByName(name);

    const dm: Dm = this.dmsRepository.create({ sender, receiver, content });

    await this.dmsRepository.save(dm);
    dm.sender = plainToClass(User, dm.sender);
    dm.receiver = plainToClass(User, dm.receiver);
    this.eventsGateway.server.to(receiver.id).emit('dm', dm);
    this.eventsGateway.server.to(sender.id).emit('dm', dm);
    return dm;
  }

  async getDMsByOppositeName(
    user: User,
    oppositeName: string,
    search?: string,
    perPage?: number,
    page?: number,
  ): Promise<Dm[]> {
    if (user.name === oppositeName) {
      throw new ConflictException(['Cannot send dm to you']);
    }

    const opposite: User = await this.usersService.getUserByName(oppositeName);

    return this.dmsRepository.getDMsByOpposite(
      user,
      opposite,
      search,
      perPage,
      page,
    );
  }

  async getDMsByOppositeNameCount(
    user: User,
    oppositeName: string,
    after?: Date,
  ): Promise<number> {
    if (user.name === oppositeName) {
      throw new ConflictException(['Cannot send dm to you']);
    }

    const opposite: User = await this.usersService.getUserByName(oppositeName);

    return this.dmsRepository.getDMsByOppositeNameCount(user, opposite, after);
  }

  getDMers(user: User, perPage?: number, page?: number): Promise<User[]> {
    return this.usersRepository.getDMers(user, perPage, page);
  }
}

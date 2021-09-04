import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Dm } from './dm.entity';
import { DmsRepository } from './dms.repository';

@Injectable()
export class DmsService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(DmsRepository)
    private readonly dmsRepository: DmsRepository,
  ) {}

  async createDm(sender: User, name?: string, content?: string): Promise<Dm> {
    if (sender.name === name) {
      throw new ConflictException('Cannot send dm to you');
    }

    const receiver: User = await this.usersService.getUserByName(name);

    const dm: Dm = this.dmsRepository.create({ sender, receiver, content });

    await this.dmsRepository.save(dm);
    // TODO socket 설정

    return dm;
  }

  async getDmsByOpposite(
    user: User,
    oppositeName: string,
    search?: string,
    perPage?: number,
    page?: number,
  ): Promise<Dm[]> {
    if (user.name === oppositeName) {
      throw new ConflictException('Cannot send dm to you');
    }

    const opposite: User = await this.usersService.getUserByName(oppositeName);

    return this.dmsRepository.getDms(user, opposite, search, perPage, page);
  }
}

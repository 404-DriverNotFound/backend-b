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
    const receiver: User = await this.usersService.getUserByName(name);

    if (sender.id === receiver.id) {
      throw new ConflictException('Cannot send dm to you');
    }

    const dm: Dm = this.dmsRepository.create({ sender, receiver, content });

    await this.dmsRepository.save(dm);
    // TODO socket 설정

    return dm;
  }
}

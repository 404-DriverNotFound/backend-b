import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UsersRepository } from 'src/users/repositories/users.repository';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(
    @InjectRepository(UsersRepository)
    private readonly usersRepository: UsersRepository,
  ) {
    super();
  }

  serializeUser(
    user: User,
    done: (err: Error, user: { id: string }) => void,
  ): any {
    const { id } = user;
    done(null, { id });
  }

  async deserializeUser(payload: User, done: (err: Error, user: User) => void) {
    const { id } = payload;
    const user: User = await this.usersRepository.findOne({ id });
    return done(null, user);
  }
}

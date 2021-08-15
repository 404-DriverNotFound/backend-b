import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { UsersRepository } from 'src/users/users.repository';

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
    console.log('serialize data: ', { id });
    done(null, { id });
  }

  async deserializeUser(payload: User, done: (err: Error, user: User) => void) {
    const { id } = payload;
    const user: User = await this.usersRepository.findOne({ id });
    console.log('deserialized data: ', user);
    return done(null, user);
  }
}

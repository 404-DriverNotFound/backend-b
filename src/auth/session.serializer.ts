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

  serializeUser(user: User, done: (err: Error, user: any) => void): any {
    const { ftId } = user;
    console.log('serialize data: ', { ftId });
    done(null, { ftId });
  }

  async deserializeUser(payload: User, done: (err: Error, user: any) => void) {
    const { ftId } = payload;
    const user: User = await this.usersRepository.findOne({ ftId });
    console.log('deserialized data: ', user);
    if (user) {
      return done(null, user);
    } else {
      return done(null, { ftId });
    }
  }
}

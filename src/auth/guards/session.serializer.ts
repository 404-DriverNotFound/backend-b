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

  async deserializeUser(payload: User, done: (err: Error, user: User) => void) {
    const { ftId } = payload;
    let user: User = await this.usersRepository.findOne({ ftId });
    user ||= { id: null, ftId, name: null, avatar: null, enable2FA: null };
    console.log('deserialized data: ', user);
    return done(null, user);
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    console.log('serializeUser user: ', user);
    const { id } = user;
    done(null, { id });
  }

  async deserializeUser(payload: User, done: (err: Error, user: User) => void) {
    console.log('deserializeUser user: ', payload);
    const user: User = await this.usersRepository.findOne({
      id: payload.id,
    });

    // FIXME how about using optional chaining to refactor conditions below?
    if (!user) {
      done(
        new UnauthorizedException(
          'request user is undefined in deserializeUser',
        ),
        undefined,
      );
    }
    console.log('founded user', user);
    done(null, user);
  }
}

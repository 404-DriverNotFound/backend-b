import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
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
    console.log('serializeUser data: ', { ftId });
    done(null, { ftId });
  }

  async deserializeUser(payload: User, done: (err: Error, user: User) => void) {
    const user: User = await this.usersRepository.findOne({
      ftId: payload.ftId,
    });
    console.log('deserialized User', user);

    if (!user) {
      return done(
        new UnauthorizedException('Request user is not found in our databases'),
        undefined,
      );
    }
    return done(null, user);
  }
}

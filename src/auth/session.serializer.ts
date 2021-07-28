import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { User } from 'src/users/user.entity';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(user: User, done: (err: Error, user: any) => void): any {
    console.log('serializeUser user: ', user);
    const { ftId } = user;
    done(null, { ftId });
  }

  async deserializeUser(
    payload: string,
    done: (err: Error, payload: string) => void,
  ) {
    console.log('deserializeUser payload: ', payload);
    // REVIEW DB에서 user가 있는지 다시 찾을 필요가 있을까요?
    // if not found done(null, false);
    done(null, payload);
  }
}

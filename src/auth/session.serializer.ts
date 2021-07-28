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
    done(null, payload);
    //const userDB = await this.authService.findUser(payload.discordId);
    //return userDB ? done(null, payload) : done(null, null);
  }
}

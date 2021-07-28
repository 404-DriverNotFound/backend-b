import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-42';

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy, '42') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('FT_APP_ID'),
      clientSecret: configService.get<string>('FT_APP_SECRET'),
      callbackURL: '/auth/42/callback',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    cb: VerifyCallback,
  ): Promise<any> {
    const { id } = profile;
    const user = {
      ftId: id,
    };
    cb(null, user);
  }
}

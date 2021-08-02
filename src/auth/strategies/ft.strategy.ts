import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy, Profile, VerifyCallback } from 'passport-42';
import { User } from 'src/users/user.entity';
import { UsersRepository } from 'src/users/users.repository';

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy, '42') {
  constructor(
    @InjectRepository(UsersRepository)
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
  ) {
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
    let user: User = await this.usersRepository.findOne({ ftId: id });
    user ||= { id: null, ftId: id, name: null, avatar: null, enable2FA: null };
    cb(null, user);
  }
}

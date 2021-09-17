import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy, Profile, VerifyCallback } from 'passport-42';
import { User } from 'src/users/entities/user.entity';
import { UsersRepository } from 'src/users/repositories/users.repository';

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
    // NOTE UNAUTHORIZED EXCEPTION in here
    const { id } = profile;
    const user: User = await this.usersRepository.findOne({ ftId: id });
    if (!user) {
      throw new UnauthorizedException(id);
    }
    return cb(null, user);
  }
}

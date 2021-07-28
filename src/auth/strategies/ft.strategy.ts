import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy, Profile, VerifyCallback } from 'passport-42';
//import { UserStatus } from 'src/users/user-status.enum';
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
    const { id, photos } = profile;
    let user: User = await this.usersRepository.findOne({ ftId: id });
    if (!user) {
      user = this.usersRepository.create({
        ftId: id,
        avatar: photos[0].value,
        permissions: [],
        //status: UserStatus.ONLINE, // REVIEW 닉네임 설정까지 완료해야 온라인 상태로 바꿀지, 42인증만 마치면 로그인으로 할지
      });
      console.log('created User', user);
      await this.usersRepository.save(user);
    }
    cb(null, user);
  }
}

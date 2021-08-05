import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { authenticator } from 'otplib';
import { OtpDto } from './dto/otp.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersRepository } from 'src/users/users.repository';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersRepository)
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  generateKeyUri(user: User): string {
    const service = this.configService.get<string>('ISSUER');
    const secret = authenticator.generateSecret();
    this.usersService.updateUserAuthenticatorSecret(user, secret);
    const otpauth = authenticator.keyuri(user.name, service, secret);
    return otpauth;
  }

  async otpAuth(user: User, otpDto: OtpDto): Promise<User> {
    const { token } = otpDto;
    const isValid: boolean = authenticator.verify({
      token,
      secret: user.authenticatorSecret,
    });
    user.isSecondFactorAuthenticated = isValid;
    try {
      await this.usersRepository.save(user);
    } catch (err) {
      throw new InternalServerErrorException(
        'Something wrong while saving user data in otpAuth',
      );
    }
    if (!isValid) {
      throw new UnauthorizedException(`${token} is not valid`);
    }
    return user;
  }
}

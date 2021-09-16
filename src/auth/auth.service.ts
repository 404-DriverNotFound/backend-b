import {
  ForbiddenException,
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
    if (!user.enable2FA) {
      throw new ForbiddenException([
        'You must enable second factor authentication to access this request.',
      ]);
    }
    if (user.authenticatorSecret) {
      throw new ForbiddenException(['You already have an QR code.']);
    }
    const service = this.configService.get<string>('ISSUER');
    const secret = authenticator.generateSecret();
    this.usersService.updateUserAuthenticatorSecret(user, secret);
    const otpauth = authenticator.keyuri(user.name, service, secret);
    return otpauth;
  }

  async otpAuth(user: User, otpDto: OtpDto): Promise<User> {
    if (!user.enable2FA || !user.authenticatorSecret) {
      throw new ForbiddenException([
        'You must get a QR code to access this request.',
      ]);
    }
    const { token } = otpDto;
    const isValid: boolean = authenticator.verify({
      token,
      secret: user.authenticatorSecret,
    });
    user.isSecondFactorAuthenticated = isValid;
    try {
      await this.usersRepository.save(user);
    } catch (err) {
      throw new InternalServerErrorException([
        'Something wrong while saving user data in otpAuth',
      ]);
    }
    if (!isValid) {
      throw new UnauthorizedException([`${token} is not valid`]);
    }
    return user;
  }
}

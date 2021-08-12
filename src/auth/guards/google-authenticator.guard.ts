import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Injectable()
export class GoogleAuthenticatorGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    console.log('GoogleAuthenticatorGuard');
    if (req.user?.enable2FA) {
      if (!req.user?.authenticatorSecret) {
        const res: Response = context.switchToHttp().getResponse();
        res.redirect(
          this.configService.get<string>('ORIGIN') + '/register/2fa',
        );
      }
      return req.user?.isSecondFactorAuthenticated;
    }
    return true;
  }
}

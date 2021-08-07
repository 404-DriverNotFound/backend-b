import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class GoogleAuthenticatorGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    console.log('GoogleAuthenticatorGuard');
    if (req.user?.enable2FA) {
      return req.user?.isSecondFactorAuthenticated;
    }
    return true;
  }
}

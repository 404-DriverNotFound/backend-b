import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    console.log('AuthenticatedGuard');
    console.log('req.user', req.user);

    // STUB 유저 생성 여부 검증
    if (!req.user.id) {
      return req.isUnauthenticated();
    }

    // STUB 2FA 인증 여부 여부 검증
    if (req.user.enable2FA === true) {
      // TODO 2FA 검증 필요
    }
    return req.isAuthenticated();
  }
}

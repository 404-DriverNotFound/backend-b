import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { RedirectException } from '../redirect.exception';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    console.log('req.isAuthenticated()', req.isAuthenticated());
    if (!req.isAuthenticated()) {
      return req.isAuthenticated();
    }
    const user: User = req.user;
    // NOTE v1
    //if (user.enable2FA) {
    //  if (!user.authenticatorSecret) {
    //    throw new RedirectException({ location: '/register/2fa' });
    //  }
    //  if (!user.isSecondFactorAuthenticated) {
    //    throw new RedirectException({ location: '/2fa' });
    //  }
    //}

    // NOTE v2
    if (user.enable2FA) {
      if (!user.isSecondFactorAuthenticated) {
        if (!user.authenticatorSecret) {
          throw new RedirectException({ location: '/register/2fa' });
        }
        throw new RedirectException({ location: '/2fa' });
      }
    }
    return req.isAuthenticated();
  }
}

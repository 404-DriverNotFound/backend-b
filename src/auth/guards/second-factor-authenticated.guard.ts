import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class SecondFactorAuthenticatedGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const user: User = request.user;
    if (user?.enable2FA) {
      if (!user.isSecondFactorAuthenticated) {
        if (!user.authenticatorSecret) {
          throw new ForbiddenException([
            'You must get a QR code to access this request.',
          ]);
        }
        throw new ForbiddenException([
          'You must validate your OTP(from google authenticator) first.',
        ]);
      }
    }
    return request.isAuthenticated();
  }
}

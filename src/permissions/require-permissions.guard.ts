import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './require-permissions.decorator';
import { Permission } from './permission.enum';

@Injectable()
export class RequirePermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new UnauthorizedException(
        'request user is undefined in RequirePermissionsGuard',
      );
      //return false;
    }
    console.log('user', user);
    return requiredPermissions.some((permission) =>
      user.permissions?.includes(permission),
    );
  }
}

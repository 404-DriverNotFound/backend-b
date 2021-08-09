import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class UserCreatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    console.log('UserCreatedGuard');
    if (!req.user?.id) {
      return false;
    }
    return true;
  }
}

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class NameGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    console.log('NameGuard');
    if (!req.user.id) {
      return false;
    }
    return true;
  }
}

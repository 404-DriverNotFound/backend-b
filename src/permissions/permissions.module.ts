import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RequirePermissionsGuard } from './require-permissions.guard';

@Module({
  providers: [{ provide: APP_GUARD, useClass: RequirePermissionsGuard }],
})
export class PermissionsModule {}

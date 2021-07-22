import { IsEnum } from 'class-validator';
import { UserStatus } from '../user-status.enum';

export class UpdateUserStatusDto {
  @IsEnum(UserStatus)
  readonly status: UserStatus;
}

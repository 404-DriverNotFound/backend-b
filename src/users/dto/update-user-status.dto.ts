import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserStatus } from '../user-status.enum';

export class UpdateUserStatusDto {
  @ApiProperty({
    enum: UserStatus,
    example: UserStatus.IN_GAME,
  })
  @IsEnum(UserStatus)
  readonly status: UserStatus;
}

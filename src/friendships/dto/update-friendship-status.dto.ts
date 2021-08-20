import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { FriendshipStatus } from '../friendship-status.enum';

export class UpdateFriendshipStatusDto {
  @ApiProperty({
    example: 'PENDING',
    description: 'Status of friendships.',
    required: true,
    enum: FriendshipStatus,
  })
  @IsNotEmpty()
  @IsEnum(FriendshipStatus)
  readonly status!: FriendshipStatus;
}

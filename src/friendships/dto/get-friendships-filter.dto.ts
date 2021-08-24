import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { FriendshipStatus } from '../friendship-status.enum';

export class GetFriendshipsFilterDto {
  @ApiProperty({
    example: 'REQUESTED',
    required: true,
    enum: FriendshipStatus,
  })
  @IsNotEmpty()
  @IsEnum(FriendshipStatus)
  readonly status!: FriendshipStatus;
}

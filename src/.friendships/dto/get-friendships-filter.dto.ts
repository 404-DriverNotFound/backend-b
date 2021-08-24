import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { FriendshipStatus } from '../friendship-status.enum';

export class GetFriendshipsFilterDto {
  @ApiProperty({
    example: 'PENDING',
    description: 'Status of friendships.',
    required: false,
    enum: FriendshipStatus,
  })
  @IsOptional()
  @IsEnum(FriendshipStatus)
  readonly status?: FriendshipStatus;
}

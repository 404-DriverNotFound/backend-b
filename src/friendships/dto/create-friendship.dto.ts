import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { FriendshipStatus } from '../friendship-status.enum';

export class CreateFriendshipDto {
  @ApiProperty({
    example: 'ykoh',
    description: 'name of user',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly addresseeName!: string;

  @ApiProperty({
    example: 'PENDING',
    description: 'PENDING or BLOCK',
    required: false,
    enum: [FriendshipStatus.PENDING, FriendshipStatus.BLOCK],
  })
  @IsOptional()
  @IsEnum([FriendshipStatus.PENDING, FriendshipStatus.BLOCK])
  readonly status?: FriendshipStatus.PENDING | FriendshipStatus.BLOCK;
}

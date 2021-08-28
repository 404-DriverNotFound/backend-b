import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, Matches } from 'class-validator';
import { FriendshipRole } from '../friendship-role.enum';
import { FriendshipStatus } from '../friendship-status.enum';

export class GetFriendsFilterDto {
  @ApiProperty({
    example: FriendshipStatus.REQUESTED,
    required: false,
    enum: [FriendshipStatus.REQUESTED],
  })
  @IsOptional()
  @Matches(/^REQUESTED$/, {
    message: `${FriendshipStatus.REQUESTED} status only.`,
  })
  readonly status?: FriendshipStatus;

  @ApiProperty({
    example: FriendshipRole.REQUESTER,
    required: false,
    enum: FriendshipRole,
  })
  @IsOptional()
  @IsEnum(FriendshipRole)
  readonly me?: FriendshipRole;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches } from 'class-validator';
import { FriendshipStatus } from '../friendship-status.enum';

export class UpdateFriendshipStatusDto {
  @ApiProperty({
    example: 'ACCEPTED',
    required: true,
    enum: [FriendshipStatus.ACCEPTED, FriendshipStatus.DECLINED],
  })
  @IsNotEmpty()
  @Matches(/^ACCEPTED$|^DECLINED$/, {
    message: `${FriendshipStatus.ACCEPTED} and ${FriendshipStatus.DECLINED} status only.`,
  })
  readonly status!: FriendshipStatus;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches } from 'class-validator';
import { FriendshipStatus } from '../friendship-status.enum';

export class GetFriendshipsFilterDto {
  @ApiProperty({
    example: 'REQUESTED',
    required: true,
    enum: [FriendshipStatus.REQUESTED],
  })
  @IsNotEmpty()
  @Matches(/^REQUESTED$/, {
    message: `${FriendshipStatus.REQUESTED} status only.`,
  })
  readonly status!: FriendshipStatus;
}

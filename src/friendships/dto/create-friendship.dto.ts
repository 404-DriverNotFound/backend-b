import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFriendshipDto {
  @ApiProperty({
    example: 'ykoh',
    description: 'name of user',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly addresseeName: string;
}

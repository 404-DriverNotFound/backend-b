import { ApiProperty, PickType } from '@nestjs/swagger';
import {
  IsAlphanumeric,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CreateChannelDto } from './create-channel.dto';

export class CreateChannelMemberDto extends PickType(CreateChannelDto, [
  'password',
] as const) {
  @ApiProperty({
    example: 'ykoh',
    description: 'Alphanumeric(3 ~ 12)',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(12)
  @IsAlphanumeric()
  readonly memberName!: string;
}

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateChannelDto {
  @ApiProperty({
    example: '채팅하실분',
    description: '채팅 제목 3~18글자',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(18)
  @Matches(/^[^\s]+(\s+[^\s]+)*$/, {
    message: 'No spaces are allowed before or after the title.',
  })
  readonly name!: string;

  @ApiProperty({
    example: '1!qQ1!qQ',
    description: '8~32 대소문자특문숫자',
    required: true,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too weak.',
  })
  readonly password?: string;
}

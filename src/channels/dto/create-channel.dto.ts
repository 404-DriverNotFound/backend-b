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
  @Matches(/^[^\\%]+$/, {
    message: 'Invalid characters(\\, %) in channel name.',
  })
  readonly name!: string;

  @ApiProperty({
    example: '1234qwer',
    description: '4 ~ 32 글자',
    required: true,
  })
  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(32)
  readonly password?: string;
}

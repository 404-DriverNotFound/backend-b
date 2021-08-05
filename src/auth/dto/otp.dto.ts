import { ApiProperty } from '@nestjs/swagger';
import {
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsNumberString,
} from 'class-validator';

export class OtpDto {
  @ApiProperty({
    example: '123456',
    description: 'Google authenticator 코드 입력',
    required: true,
  })
  @IsNotEmpty()
  @IsNumberString()
  @MinLength(6)
  @MaxLength(6)
  readonly token: string;
}

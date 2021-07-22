import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, Matches, MaxLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'ykoh',
    description: 'Alphanumeric(3 ~ 12)',
    required: true,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(12)
  @Matches(/^[a-zA-Z0-9_]*$/, {
    message: 'name must be alphanumeric!',
  })
  readonly name: string;

  // NOTE 사용하지 않지만 swagger 때문에 추가
  @ApiProperty({
    example: 'image.png',
    description: 'MIME type image',
    type: 'string',
    format: 'binary',
    required: false,
  })
  readonly avatar?: string;
}

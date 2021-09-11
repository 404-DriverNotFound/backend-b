import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsAlphanumeric,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: '123456',
    description: '42 unique id',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly ftId!: number;

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
  readonly name!: string;

  // NOTE 실제 사용되진 않지만 swagger 문서를 위해 남겨둠.
  @ApiProperty({
    example: 'image.png',
    description: 'MIME type image',
    type: 'string',
    format: 'binary',
    required: false,
  })
  readonly avatar?: string;

  @ApiProperty({
    example: 'false',
    description: 'boolean only',
    required: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  readonly enable2FA!: boolean;
}

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MinLength,
  Matches,
  MaxLength,
  IsAlphanumeric,
  IsBooleanString,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'ykoh',
    description: 'Alphanumeric(3 ~ 12)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(12)
  @IsAlphanumeric()
  readonly name?: string;

  @ApiProperty({
    example: '/users/ykoh.jpg',
    description: 'image format only',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i, {
    message: 'not a image file!',
  })
  readonly avatar?: string;

  @ApiProperty({
    example: 'false',
    description: 'boolean string only',
    required: false,
  })
  @IsOptional()
  @IsBooleanString()
  readonly enable2FA?: boolean;
}

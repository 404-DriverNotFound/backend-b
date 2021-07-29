import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MinLength,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'ykoh',
    description: 'Alphanumeric(3 ~ 12)',
    required: true,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(12)
  @Matches(/^[a-zA-Z0-9_]*$/, {
    message: 'name must be alphanumeric!',
  })
  readonly name?: string;

  @ApiProperty({
    example: '/imgsrc/avatar.png',
    description: 'image format only',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i, {
    message: 'not a image file!',
  })
  readonly avatar?: string;
}

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
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(12)
  @IsAlphanumeric()
  readonly name?: string;

  @IsOptional()
  @IsString()
  @Matches(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i, {
    message: 'not a image file!',
  })
  readonly avatar?: string;

  @IsOptional()
  @IsBooleanString()
  readonly enable2FA?: boolean;
}

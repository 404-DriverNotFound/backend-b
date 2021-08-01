import {
  IsString,
  IsOptional,
  MinLength,
  Matches,
  MaxLength,
  IsNotEmpty,
  IsAlphanumeric,
  IsNumberString,
  IsBooleanString,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsNumberString()
  readonly ftId: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(12)
  @IsAlphanumeric()
  readonly name: string;

  @IsOptional()
  @IsString()
  @Matches(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i, {
    message: 'not a image file!',
  })
  readonly avatar?: string;

  @IsNotEmpty()
  @IsBooleanString()
  readonly enable2FA: boolean;
}

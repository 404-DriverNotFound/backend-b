import {
  IsString,
  IsOptional,
  MinLength,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(12)
  @Matches(/^[a-zA-Z0-9_]*$/, {
    message: 'Name must be alphanumeric!',
  })
  readonly name: string;

  @IsOptional()
  @IsString()
  @Matches(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i, {
    message: 'Not a image file!',
  })
  readonly avatar?: string;
}

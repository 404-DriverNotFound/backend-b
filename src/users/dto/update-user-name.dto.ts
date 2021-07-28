import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateUserNameDto {
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
}

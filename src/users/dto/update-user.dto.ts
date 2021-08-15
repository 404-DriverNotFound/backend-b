import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsAlphanumeric,
  IsBooleanString,
  IsEnum,
} from 'class-validator';
import { UserStatus } from '../user-status.enum';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Alphanumeric(3 ~ 12)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(12)
  @IsAlphanumeric()
  readonly name?: string;

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
    description: 'boolean string only',
    required: false,
  })
  @IsOptional()
  @IsBooleanString()
  readonly enable2FA?: string;

  //@ApiProperty({
  //  example: 'ONLINE',
  //  description: 'ONLINE, OFFLINE and IN_GAME',
  //  required: false,
  //  enum: UserStatus,
  //})
  //@IsOptional()
  //@IsEnum(UserStatus)
  //readonly status?: UserStatus;
}

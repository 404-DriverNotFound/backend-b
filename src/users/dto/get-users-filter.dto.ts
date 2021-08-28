import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsNumber,
  Min,
  IsBase64,
  IsString,
  MaxLength,
  IsAlphanumeric,
} from 'class-validator';

export class GetUsersFilterDto {
  @ApiProperty({
    description: 'User name search (Alphanumeric)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(12)
  @IsAlphanumeric()
  search?: string;

  @ApiProperty({
    description: 'counts per request',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  readonly limit?: number;

  @ApiProperty({
    description: 'Usage of both before and after cursor is undefined.',
    required: false,
  })
  @IsOptional()
  @IsBase64()
  readonly beforeCursor?: string;

  @ApiProperty({
    description: 'Usage of both before and after cursor is undefined.',
    required: false,
  })
  @IsOptional()
  @IsBase64()
  readonly afterCursor?: string;
}

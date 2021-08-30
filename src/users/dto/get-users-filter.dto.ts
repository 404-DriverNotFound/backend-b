import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsNumber,
  Min,
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
    description: 'counts per page',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  readonly perPage?: number;

  @ApiProperty({
    description: 'pages',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  readonly page?: number;
}

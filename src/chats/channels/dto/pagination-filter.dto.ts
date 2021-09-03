import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsNumber,
  Min,
  IsString,
  MaxLength,
} from 'class-validator';

export class PaginationFilterDto {
  @ApiProperty({
    description: 'Channel name search',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Transform(({ value }) => value.trim())
  readonly search?: string;

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

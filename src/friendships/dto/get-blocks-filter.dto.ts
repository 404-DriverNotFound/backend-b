import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class GetBlocksFilterDto {
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

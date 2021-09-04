import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsDate } from 'class-validator';

export class GetChannelChatsCountDto {
  @ApiProperty({
    description: 'date',
    required: false,
    default: new Date(),
    type: Date,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  readonly after?: Date;
}

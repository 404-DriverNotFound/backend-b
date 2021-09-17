import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateChannelChatDto {
  @ApiProperty({
    example: '안녕하세요 ㅎㅎ',
    description: '메시지 입력',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly content!: string;
}

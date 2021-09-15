import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { MatchType } from '../match-type.enum';

export class CreateMatchDto extends PickType(CreateUserDto, ['name'] as const) {
  @ApiProperty({
    example: MatchType.LADDER,
    required: true,
    enum: MatchType,
  })
  @IsNotEmpty()
  @IsEnum(MatchType)
  readonly type!: MatchType;
}

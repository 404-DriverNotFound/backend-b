import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export class CreateMatchDto extends PickType(CreateUserDto, [
  'name',
] as const) {}

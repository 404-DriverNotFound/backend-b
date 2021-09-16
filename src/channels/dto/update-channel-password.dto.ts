import { PickType } from '@nestjs/swagger';
import { CreateChannelDto } from './create-channel.dto';

export class UpdateChannelPasswordDto extends PickType(CreateChannelDto, [
  'password',
] as const) {}

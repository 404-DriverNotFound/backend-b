import { IntersectionType, PickType } from '@nestjs/swagger';
import { CreateChannelChatDto } from 'src/channels/dto/create-channel-chat.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export class CreateDmDto extends IntersectionType(
  PickType(CreateUserDto, ['name'] as const),
  PickType(CreateChannelChatDto, ['content'] as const),
) {}

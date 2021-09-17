import { InjectRepository } from '@nestjs/typeorm';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Channel } from 'src/channels/entities/channel.entity';
import { ChannelsRepository } from 'src/channels/repositories/channels.repository';
import { UserStatus } from 'src/users/constants/user-status.enum';
import { User } from 'src/users/entities/user.entity';
import { UsersRepository } from 'src/users/repositories/users.repository';

@WebSocketGateway()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectRepository(ChannelsRepository)
    private readonly channelsRepository: ChannelsRepository,
    @InjectRepository(UsersRepository)
    private readonly usersRepository: UsersRepository,
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket): Promise<string> {
    console.log('connected');

    const userId: string = client.handshake.query.userId as string;
    const user: User = await this.usersRepository.findOne({ id: userId });
    if (!user) {
      return 'User not found.';
    }

    user.status = UserStatus.ONLINE;
    await this.usersRepository.save(user);

    client.join(user.id);

    const channel: Channel[] = await this.channelsRepository.getChannelsByMe(
      user,
    );
    channel.forEach((channel: Channel) => client.join(channel.id));

    return `${user.name} connected.`;
  }

  async handleDisconnect(@ConnectedSocket() client: Socket): Promise<string> {
    console.log('disconnected');

    const userId: string = client.handshake.query.userId as string;
    const user: User = await this.usersRepository.findOne({ id: userId });
    if (!user) {
      return 'user not found.';
    }

    user.status = UserStatus.OFFLINE;
    await this.usersRepository.save(user);

    client.leave(user.id);

    const channel: Channel[] = await this.channelsRepository.getChannelsByMe(
      user,
    );
    channel.forEach((channel: Channel) => client.leave(channel.id));

    return `${user.name} disconnected.`;
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() channel: Channel,
  ): string {
    client.join(channel.id);
    return 'Joined the channel.';
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() channel: Channel,
  ): string {
    client.leave(channel.id);
    return 'Leaved the channel.';
  }
}

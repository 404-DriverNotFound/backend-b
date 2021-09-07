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
import { User } from 'src/users/user.entity';

@WebSocketGateway()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectRepository(ChannelsRepository)
    private readonly channelsRepository: ChannelsRepository,
  ) {}

  handleConnection(@ConnectedSocket() client: Socket) {
    console.log('connected client.id: ', client.id);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log('disconnected client.id: ', client.id);
  }

  @SubscribeMessage('join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() user: User,
  ) {
    console.log(user);
    (await this.channelsRepository.getChannelsByMe(user)).forEach(
      (channel: Channel) => {
        client.join(channel.id);
      },
    );
    console.log(client.rooms);
    return 'joined';
  }
}

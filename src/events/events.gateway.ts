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
import { User } from 'src/users/entities/user.entity';
import { UserStatus } from 'src/users/constants/user-status.enum';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { LobbyManagerService } from './games/lobby-manager.service';
import { RoomManagerService } from './games/room-manager.service';
import { KeyCode } from './games/constants/key-code.enum';

@WebSocketGateway()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectRepository(ChannelsRepository)
    private readonly channelsRepository: ChannelsRepository,
    @InjectRepository(UsersRepository)
    private readonly usersRepository: UsersRepository,
    private readonly lobbyManagerService: LobbyManagerService,
    private readonly roomManagerService: RoomManagerService,
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

    // TODO 소켓이 끊어지면 플레이어일때 게임 종료되는 로직 추가
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

  // NOTE events for Game below:

  // TODO 게임에 입장하는 event

  // TODO 게임에서 나가는 event??

  @SubscribeMessage('waiting')
  handleWaiting(@ConnectedSocket() client: Socket) {
    this.lobbyManagerService.lobby.add(client);
    this.lobbyManagerService.dispatch(this.server); // FIXME roommanager
  }

  @SubscribeMessage('ready')
  handleReady(@ConnectedSocket() client: Socket) {
    const roomId: string = this.roomManagerService.roomIds[client.id];
    if (roomId) {
      this.roomManagerService.rooms[roomId].players[client.id].ready = true;
    }
  }

  @SubscribeMessage('keydown')
  handleKeyDown(
    @ConnectedSocket() client: Socket,
    @MessageBody() keyCode: KeyCode,
  ) {
    const roomId: string = this.roomManagerService.roomIds[client.id];
    if (roomId) {
      this.roomManagerService.rooms[roomId].players[client.id].keypress[
        keyCode
      ] = true;
    }
  }

  @SubscribeMessage('keyup') // NOTE front에 알려야함 keypress로 바뀌었다고.
  handlekeyUp(
    @ConnectedSocket() client: Socket,
    @MessageBody() keyCode: KeyCode,
  ) {
    const roomId: string = this.roomManagerService.roomIds[client.id];
    if (roomId) {
      //  delete this.roomManagerService.rooms[roomId].players[client.id].keypress[
      //    keyCode
      //  ];
      // REVIEW delete or assign false
      this.roomManagerService.rooms[roomId].players[client.id].keypress[
        keyCode
      ] = false;
    }
  }

  @SubscribeMessage('mousemove')
  handleMouseMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() mouse: any,
  ) {
    const roomId: string = this.roomManagerService.roomIds[client.id];
    if (roomId) {
      this.roomManagerService.rooms[roomId].players[client.id].mouse.move = {
        x: mouse[0],
        y: mouse[1],
      };
    }
  }

  @SubscribeMessage('click')
  handleClick(@ConnectedSocket() client: Socket, @MessageBody() mouse: any) {
    const roomId: string = this.roomManagerService.roomIds[client.id];
    if (roomId) {
      this.roomManagerService.rooms[roomId].players[client.id].mouse.click = {
        x: mouse[0],
        y: mouse[1],
      };
    }
  }
}

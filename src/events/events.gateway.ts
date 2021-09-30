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
import { KeyCode } from './games/constants/key-code.enum';
import { EventsService } from './events.service';
import { OnMatchTypeModeDto } from './games/dto/on-match-type-mode.dto';

@WebSocketGateway()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly eventsService: EventsService) {}

  handleConnection(@ConnectedSocket() client: Socket): Promise<string> {
    return this.eventsService.handleConnection(client);
  }

  handleDisconnect(@ConnectedSocket() client: Socket): Promise<string> {
    return this.eventsService.handleDisconnect(client);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() channel: Channel,
  ): string {
    return this.eventsService.handleJoinRoom(client, channel);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() channel: Channel,
  ): string {
    return this.eventsService.handleLeaveRoom(client, channel);
  }

  // NOTE events for Game below:

  @SubscribeMessage('waiting')
  handleWaiting(
    @ConnectedSocket() client: Socket,
    @MessageBody() { type, mode }: OnMatchTypeModeDto,
  ): void {
    return this.eventsService.handleWaiting(this.server, client, type, mode);
  }

  @SubscribeMessage('ready')
  handleReady(@ConnectedSocket() client: Socket): void {
    return this.eventsService.handleReady(client);
  }

  @SubscribeMessage('keydown')
  handleKeyDown(
    @ConnectedSocket() client: Socket,
    @MessageBody() keyCode: KeyCode,
  ): void {
    return this.eventsService.handleKeyDown(client, keyCode);
  }

  @SubscribeMessage('keyup')
  handlekeyUp(
    @ConnectedSocket() client: Socket,
    @MessageBody() keyCode: KeyCode,
  ): void {
    return this.eventsService.handlekeyUp(client, keyCode);
  }

  @SubscribeMessage('leaveGame')
  handleLeaveGame(@ConnectedSocket() client: Socket): string {
    return this.eventsService.handleLeaveGame(this.server, client);
  }
}

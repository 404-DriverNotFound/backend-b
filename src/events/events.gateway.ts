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
import { EventsService } from './events.service';
import { InviteMatchDto } from './games/dto/invite-match.dto';
import { MatchModeDto } from './games/dto/match-mode.dto';
import { WatchMatchDto } from './games/dto/watch-match.dto';
import { ChannelDto } from './games/dto/channel.dto';
import { KeyCodeDto } from './games/dto/key-code.dto';

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
    @MessageBody() { id }: ChannelDto,
  ): string {
    return this.eventsService.handleJoinRoom(client, id);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() { id }: ChannelDto,
  ): string {
    return this.eventsService.handleLeaveRoom(client, id);
  }

  // NOTE events for Game below:

  @SubscribeMessage('waiting')
  handleWaiting(
    @ConnectedSocket() client: Socket,
    @MessageBody() { mode }: MatchModeDto,
  ): void {
    return this.eventsService.handleWaiting(this.server, client, mode);
  }

  @SubscribeMessage('ready')
  handleReady(@ConnectedSocket() client: Socket): void {
    return this.eventsService.handleReady(client);
  }

  @SubscribeMessage('keydown')
  handleKeyDown(
    @ConnectedSocket() client: Socket,
    @MessageBody() { keyCode }: KeyCodeDto,
  ): void {
    return this.eventsService.handleKeyDown(client, keyCode);
  }

  @SubscribeMessage('keyup')
  handlekeyUp(
    @ConnectedSocket() client: Socket,
    @MessageBody() { keyCode }: KeyCodeDto,
  ): void {
    return this.eventsService.handlekeyUp(client, keyCode);
  }

  @SubscribeMessage('leaveGame')
  handleLeaveGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() { mode }: MatchModeDto,
  ): string {
    return this.eventsService.handleLeaveGame(this.server, client, mode);
  }

  @SubscribeMessage('watchMatch')
  handleWatchMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() { id }: WatchMatchDto,
  ): Promise<void> {
    return this.eventsService.handleWatchMatch(this.server, client, id);
  }

  @SubscribeMessage('inviteMatch')
  handleInviteMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() { mode, opponentUserId }: InviteMatchDto,
  ): Promise<void> {
    return this.eventsService.handleInviteMatch(
      this.server,
      client,
      mode,
      opponentUserId,
    );
  }

  @SubscribeMessage('acceptMatch')
  handleAcceptMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() { mode, opponentSocketId }: InviteMatchDto,
  ): Promise<void> {
    return this.eventsService.handleAcceptMatch(
      this.server,
      client,
      mode,
      opponentSocketId,
    );
  }

  @SubscribeMessage('declineMatch')
  handleDeclineMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() { opponentSocketId }: InviteMatchDto,
  ): Promise<void> {
    return this.eventsService.handleDeclineMatch(
      this.server,
      client,
      opponentSocketId,
    );
  }

  @SubscribeMessage('cancelMatchInvitation')
  handleCancelMatchInvitation(
    @MessageBody() { opponentUserId }: InviteMatchDto,
  ): Promise<void> {
    return this.eventsService.handleCancelMatchInvitation(
      this.server,
      opponentUserId,
    );
  }
}

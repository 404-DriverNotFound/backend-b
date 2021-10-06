import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Server, Socket } from 'socket.io';
import { Channel } from 'src/channels/entities/channel.entity';
import { ChannelsRepository } from 'src/channels/repositories/channels.repository';
import { UserStatus } from 'src/users/constants/user-status.enum';
import { User } from 'src/users/entities/user.entity';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { KeyCode } from './games/constants/key-code.enum';
import { LobbyManagerService } from './games/lobby-manager.service';
import { RoomManagerService } from './games/room-manager.service';
import { MatchType } from '../matches/constants/match-type.enum';
import { MatchGameMode } from '../matches/constants/match-game-mode.enum';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(ChannelsRepository)
    private readonly channelsRepository: ChannelsRepository,
    @InjectRepository(UsersRepository)
    private readonly usersRepository: UsersRepository,
    private readonly lobbyManagerService: LobbyManagerService,
    private readonly roomManagerService: RoomManagerService,
  ) {}

  async handleConnection(client: Socket): Promise<string> {
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

  async handleDisconnect(client: Socket): Promise<string> {
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

  handleJoinRoom(client: Socket, channel: Channel): string {
    client.join(channel.id);
    return 'Joined the channel.';
  }

  handleLeaveRoom(client: Socket, channel: Channel): string {
    client.leave(channel.id);
    return 'Leaved the channel.';
  }

  // NOTE events for Game below:

  handleWaiting(
    server: Server,
    client: Socket,
    type: MatchType,
    mode: MatchGameMode,
  ): void {
    const set = this.lobbyManagerService.queue(type, mode);
    set.add(client);
    this.lobbyManagerService.dispatch(server, set, type, mode); // FIXME roommanager
  }

  handleReady(client: Socket): void {
    const roomId: string = this.roomManagerService.roomIds.get(client.id);
    if (roomId) {
      this.roomManagerService.rooms.get(roomId).players.get(client.id).ready =
        true;
    }
  }

  handleKeyDown(client: Socket, keyCode: KeyCode): void {
    const roomId: string = this.roomManagerService.roomIds.get(client.id);
    if (roomId) {
      this.roomManagerService.rooms.get(roomId).players.get(client.id).keypress[
        keyCode
      ] = true;
    }
  }

  handlekeyUp(client: Socket, keyCode: KeyCode): void {
    const roomId: string = this.roomManagerService.roomIds.get(client.id);
    if (roomId) {
      delete this.roomManagerService.rooms.get(roomId).players.get(client.id)
        .keypress[keyCode];
    }
  }

  handleLeaveGame(
    server: Server,
    client: Socket,
    type: MatchType,
    mode: MatchGameMode,
  ): string {
    // TODO 소켓이 끊어지면 플레이어일때 게임 종료되는 로직 추가
    const roomId: string = this.roomManagerService.roomIds.get(client.id);
    if (roomId) {
      this.roomManagerService.destroyRoom(server, roomId);
    }
    this.lobbyManagerService.queue(type, mode).delete(client);
    return 'You leave the game.';
  }

  async getOpponentSocketId(
    server: Server,
    opponentUserId: string,
  ): Promise<string> {
    const clientIds: string[] = [...(await server.allSockets())];

    const opponentSocketId: string = clientIds
      .reverse()
      .find((clientId: string) => {
        const client: Socket = server.sockets.sockets.get(clientId);
        const userId: string = client.handshake.query.userId as string;
        return userId === opponentUserId ? true : false;
      });

    return opponentSocketId;
  }

  async handleInviteMatch(
    server: Server,
    client: Socket,
    mode: MatchGameMode,
    opponentUserId: string,
  ): Promise<void> {
    const opponentSocketId: string = await this.getOpponentSocketId(
      server,
      opponentUserId,
    );

    const opponent: User = await this.usersRepository.findOne(opponentUserId);

    const user: User = await this.usersRepository.findOne(
      client.handshake.query.userId as string,
    );

    if (
      !opponentSocketId &&
      user?.status !== UserStatus.ONLINE &&
      opponent?.status !== UserStatus.ONLINE
    ) {
      server.to(client.id).emit('declined', {
        message: `${opponent?.name}(${opponent?.status}) cannot receive your invitation.`,
      });
    } else {
      server.to(opponentUserId).emit('invitedToMatch', {
        mode,
        opponent: user,
        opponentSocketId,
      });
    }
  }

  async handleAcceptMatch(
    server: Server,
    client: Socket,
    mode: MatchGameMode,
    opponentSocketId: string,
  ): Promise<void> {
    const opponentUserId: string = server.sockets.sockets.get(opponentSocketId)
      .handshake.query.userId as string;
    const opponent: User = await this.usersRepository.findOne(opponentUserId);

    const user: User = await this.usersRepository.findOne(
      client.handshake.query.userId as string,
    );

    if (
      user?.status !== UserStatus.ONLINE &&
      opponent?.status !== UserStatus.ONLINE
    ) {
      server.to(client.id).emit('canceled', {
        message: `You cannot accept ${opponent?.name}(${opponent?.status})'s invitation.`,
      });
    } else {
      const opponentSocket: Socket =
        server.sockets.sockets.get(opponentSocketId);

      this.roomManagerService.createRoom(
        server,
        opponentSocket,
        client,
        MatchType.EXHIBITION,
        mode,
      );
    }
  }

  async handleDeclineMatch(
    server: Server,
    client: Socket,
    opponentSocketId: string,
  ): Promise<void> {
    const opponentUserId: string = server.sockets.sockets.get(opponentSocketId)
      .handshake.query.userId as string;
    const opponent: User = await this.usersRepository.findOne(opponentUserId);

    const user: User = await this.usersRepository.findOne(
      client.handshake.query.userId as string,
    );

    if (
      !opponentSocketId &&
      user?.status !== UserStatus.ONLINE &&
      opponent?.status !== UserStatus.ONLINE
    ) {
      server.to(client.id).emit('canceled', {
        message: `You cannot decline ${opponent?.name}(${opponent?.status})'s invitation.`,
      });
    } else {
      server
        .to(opponentSocketId)
        .emit('declined', { message: 'Your invitation has been declined.' });
    }
  }

  async handleCancelMatchInvitation(
    server: Server,
    opponentId: string,
  ): Promise<void> {
    const opponentSocketId: string = await this.getOpponentSocketId(
      server,
      opponentId,
    );

    server
      .to(opponentSocketId)
      .emit('canceled', { message: 'Match invitation has been canceled.' });
  }
}

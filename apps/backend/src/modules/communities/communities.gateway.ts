import { UsePipes, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MemberStatus } from '@spotwave/database';
import { Server, Socket } from 'socket.io';
import { DatabaseService } from '../../core/database/database.service';

type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

type CommunityMessagePayload = {
  id: string;
  communityId: string;
  message: string;
  createdAt: Date;
  user: {
    id: string;
    email: string;
    displayName: string | null;
    avatarUrl?: string | null;
  };
};

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class CommunitiesGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    const userId = await this.resolveUserId(client);
    if (!userId) {
      client.disconnect(true);
      return;
    }

    client.data.userId = userId;
  }

  @SubscribeMessage('community:join')
  async joinCommunity(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { communityId?: string },
  ) {
    const communityId = payload.communityId;
    const userId = client.data.userId as string | undefined;
    if (!communityId || !userId) {
      client.emit('community:error', { message: 'Invalid community subscription' });
      return;
    }

    const member = await this.db.client.communityMember.findUnique({
      where: { communityId_userId: { communityId, userId } },
      select: { status: true },
    });

    if (!member || member.status !== MemberStatus.ACTIVE) {
      client.emit('community:error', { message: 'Only active members can join community chat' });
      return;
    }

    await client.join(this.roomName(communityId));
    client.emit('community:joined', { communityId });
  }

  @SubscribeMessage('community:leave')
  async leaveCommunity(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { communityId?: string },
  ) {
    if (payload.communityId) {
      await client.leave(this.roomName(payload.communityId));
    }
  }

  emitMessage(message: CommunityMessagePayload) {
    this.server.to(this.roomName(message.communityId)).emit('community:message', message);
  }

  private async resolveUserId(client: Socket) {
    const token =
      this.readToken(client.handshake.auth?.token) ??
      this.readToken(client.handshake.headers.authorization);

    if (!token) return null;

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });
      return payload.sub;
    } catch {
      return null;
    }
  }

  private readToken(value: unknown) {
    if (typeof value !== 'string' || !value.trim()) return null;
    return value.startsWith('Bearer ') ? value.slice(7) : value;
  }

  private roomName(communityId: string) {
    return `community:${communityId}`;
  }
}

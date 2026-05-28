import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ParticipantStatus } from '@spotwave/database';
import { DatabaseService } from '../../core/database/database.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';

@Injectable()
export class ChatService {
  constructor(private readonly db: DatabaseService) {}

  async list(eventId: string, userId: string) {
    await this.assertParticipant(eventId, userId);

    const items = await this.db.client.eventChatMessage.findMany({
      where: { eventId },
      include: { user: { select: { id: true, displayName: true, email: true } } },
      orderBy: { createdAt: 'asc' },
      take: 300,
    });

    return { items };
  }

  async send(eventId: string, userId: string, dto: CreateChatMessageDto) {
    await this.assertParticipant(eventId, userId);

    return this.db.client.eventChatMessage.create({
      data: { eventId, userId, message: dto.message.trim() },
      include: { user: { select: { id: true, displayName: true, email: true } } },
    });
  }

  private async assertParticipant(eventId: string, userId: string) {
    const participant = await this.db.client.eventParticipant.findUnique({
      where: { eventId_userId: { eventId, userId } },
      select: { status: true },
    });

    if (!participant || participant.status === ParticipantStatus.LEFT) {
      throw new ForbiddenException('Only active participants can access chat');
    }

    const event = await this.db.client.event.findUnique({ where: { id: eventId }, select: { id: true } });
    if (!event) throw new NotFoundException('Event not found');
  }
}

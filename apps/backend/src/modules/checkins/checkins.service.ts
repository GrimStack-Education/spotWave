import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventStatus, ParticipantStatus } from '@spotwave/database';
import { DatabaseService } from '../../core/database/database.service';
import { CreateCheckInDto } from './dto/create-checkin.dto';

@Injectable()
export class CheckInsService {
  constructor(private readonly db: DatabaseService) {}

  async create(eventId: string, userId: string, dto: CreateCheckInDto) {
    const event = await this.db.client.event.findUnique({
      where: { id: eventId },
      select: { id: true, status: true },
    });
    if (!event) throw new NotFoundException('Event not found');
    if (event.status !== EventStatus.ACTIVE)
      throw new ConflictException('Check-in available only for active events');

    const participant = await this.db.client.eventParticipant.findUnique({
      where: { eventId_userId: { eventId, userId } },
      select: { status: true },
    });
    if (!participant || participant.status !== ParticipantStatus.JOINED) {
      throw new ForbiddenException('Only joined participants can check in');
    }

    return this.db.client.eventCheckIn.upsert({
      where: { eventId_userId: { eventId, userId } },
      create: { eventId, userId, method: dto.method, code: dto.code?.trim() },
      update: { method: dto.method, code: dto.code?.trim() },
    });
  }
}

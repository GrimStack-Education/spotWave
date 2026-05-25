import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly db: DatabaseService) {}

  create(userId: string, dto: CreateEventDto) {
    return this.db.client.eventArchive.create({
      data: {
        creatorId: userId,
        firebaseEventId: dto.firebaseEventId,
        title: dto.title,
        description: dto.description,
        startTime: new Date(dto.startsAt),
        endTime: new Date(dto.endsAt),
        categoryId: dto.categoryId,
        venueId: dto.venueId,
      },
    });
  }

  async update(eventId: string, userId: string, userRole: string, dto: UpdateEventDto) {
    const event = await this.db.client.eventArchive.findUnique({
      where: { id: eventId },
      select: { id: true, creatorId: true },
    });

    if (!event) throw new NotFoundException(`Event with id "${eventId}" was not found`);
    this.assertCanModify(event.creatorId, userId, userRole);

    return this.db.client.eventArchive.update({
      where: { id: eventId },
      data: {
        firebaseEventId: dto.firebaseEventId,
        title: dto.title,
        description: dto.description,
        startTime: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endTime: dto.endsAt ? new Date(dto.endsAt) : undefined,
        categoryId: dto.categoryId,
        venueId: dto.venueId,
      },
    });
  }

  async remove(eventId: string, userId: string, userRole: string) {
    const event = await this.db.client.eventArchive.findUnique({
      where: { id: eventId },
      select: { id: true, creatorId: true },
    });

    if (!event) throw new NotFoundException(`Event with id "${eventId}" was not found`);
    this.assertCanModify(event.creatorId, userId, userRole);

    await this.db.client.eventArchive.delete({ where: { id: eventId } });
    return { deleted: true };
  }

  private assertCanModify(creatorId: string, userId: string, userRole: string) {
    if (creatorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only creator or admin can modify this event');
    }
  }
}

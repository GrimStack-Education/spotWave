import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventVisibility } from '@spotwave/database';
import { DatabaseService } from '../../core/database/database.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly db: DatabaseService) {}

  create(userId: string, dto: CreateEventDto) {
    return this.db.client.event.create({
      data: {
        creatorId: userId,
        title: dto.title,
        description: dto.description,
        startsAt: new Date(dto.startsAt),
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        lat: dto.lat,
        lng: dto.lng,
        addressText: dto.addressText,
        capacity: dto.capacity,
        visibility: dto.visibility ?? EventVisibility.NEIGHBORHOOD,
      },
    });
  }

  async update(eventId: string, userId: string, userRole: string, dto: UpdateEventDto) {
    const event = await this.db.client.event.findUnique({
      where: { id: eventId },
      select: { id: true, creatorId: true },
    });

    if (!event) throw new NotFoundException(`Event with id "${eventId}" was not found`);
    this.assertCanModify(event.creatorId, userId, userRole);

    return this.db.client.event.update({
      where: { id: eventId },
      data: {
        title: dto.title,
        description: dto.description,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        lat: dto.lat,
        lng: dto.lng,
        addressText: dto.addressText,
        capacity: dto.capacity,
        visibility: dto.visibility,
      },
    });
  }

  async remove(eventId: string, userId: string, userRole: string) {
    const event = await this.db.client.event.findUnique({
      where: { id: eventId },
      select: { id: true, creatorId: true },
    });

    if (!event) throw new NotFoundException(`Event with id "${eventId}" was not found`);
    this.assertCanModify(event.creatorId, userId, userRole);

    await this.db.client.event.delete({ where: { id: eventId } });
    return { deleted: true };
  }

  private assertCanModify(creatorId: string, userId: string, userRole: string) {
    if (creatorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only creator or admin can modify this event');
    }
  }
}

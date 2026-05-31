import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ParticipantStatus } from '@spotwave/database';
import { DatabaseService } from '../../core/database/database.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly db: DatabaseService) {}

  async list(eventId: string) {
    const items = await this.db.client.eventReview.findMany({
      where: { eventId },
      include: {
        author: { select: { id: true, email: true, displayName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { items };
  }

  async create(eventId: string, userId: string, dto: CreateReviewDto) {
    const event = await this.db.client.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });
    if (!event) throw new NotFoundException('Event not found');

    const participant = await this.db.client.eventParticipant.findUnique({
      where: { eventId_userId: { eventId, userId } },
      select: { status: true },
    });

    if (!participant || participant.status === ParticipantStatus.LEFT) {
      throw new ForbiddenException('Only participants can leave review');
    }

    return this.db.client.eventReview.upsert({
      where: { eventId_authorUserId: { eventId, authorUserId: userId } },
      create: {
        eventId,
        authorUserId: userId,
        rating: dto.rating,
        text: dto.text.trim(),
      },
      update: { rating: dto.rating, text: dto.text.trim() },
      include: {
        author: { select: { id: true, email: true, displayName: true } },
      },
    });
  }
}

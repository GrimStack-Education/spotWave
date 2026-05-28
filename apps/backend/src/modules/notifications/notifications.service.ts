import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType, Prisma } from '@spotwave/database';
import { DatabaseService } from '../../core/database/database.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly db: DatabaseService) {}

  async list(userId: string) {
    const items = await this.db.client.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return { items };
  }

  async markRead(userId: string, id: string) {
    const item = await this.db.client.notification.findUnique({ where: { id } });
    if (!item || item.userId !== userId) throw new NotFoundException('Notification not found');

    return this.db.client.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  async push(input: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    meta?: Record<string, unknown>;
  }) {
    return this.db.client.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        meta: input.meta as Prisma.InputJsonValue | undefined,
      },
    });
  }
}

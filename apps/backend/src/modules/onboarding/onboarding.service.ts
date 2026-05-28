import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@spotwave/database';
import { DatabaseService } from '../../core/database/database.service';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';

@Injectable()
export class OnboardingService {
  private static readonly defaultInterests = [
    { name: 'Настолки', slug: 'board-games', icon: 'dice' },
    { name: 'Бег', slug: 'running', icon: 'activity' },
    { name: 'Языковые клубы', slug: 'language-clubs', icon: 'languages' },
    { name: 'Искусство', slug: 'art', icon: 'palette' },
    { name: 'Теннис', slug: 'tennis', icon: 'dribbble' },
    { name: 'Стартапы', slug: 'startups', icon: 'rocket' },
  ] as const;

  constructor(private readonly db: DatabaseService) {}

  async get(userId: string) {
    const user = await this.db.client.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        profile: true,
        interests: { select: { interestId: true } },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return {
      radiusKm: user.profile?.radiusKm ?? 5,
      homeLat: user.profile?.homeLat ? Number(user.profile.homeLat) : null,
      homeLng: user.profile?.homeLng ? Number(user.profile.homeLng) : null,
      interestIds: user.interests.map((it) => it.interestId),
      completed: user.interests.length > 0,
    };
  }

  async listInterests() {
    for (const item of OnboardingService.defaultInterests) {
      await this.db.client.interest.upsert({
        where: { slug: item.slug },
        update: { name: item.name, icon: item.icon },
        create: {
          name: item.name,
          slug: item.slug,
          icon: item.icon,
        },
      });
    }

    const items = await this.db.client.interest.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, icon: true },
    });

    return { items };
  }

  async update(userId: string, dto: UpdateOnboardingDto) {
    await this.db.client.$transaction(async (tx) => {
      await tx.profile.upsert({
        where: { userId },
        create: {
          userId,
          displayName: 'SpotWave User',
          radiusKm: dto.radiusKm,
          homeLat: dto.homeLat != null ? new Prisma.Decimal(dto.homeLat) : null,
          homeLng: dto.homeLng != null ? new Prisma.Decimal(dto.homeLng) : null,
        },
        update: {
          radiusKm: dto.radiusKm,
          homeLat: dto.homeLat != null ? new Prisma.Decimal(dto.homeLat) : null,
          homeLng: dto.homeLng != null ? new Prisma.Decimal(dto.homeLng) : null,
        },
      });

      await tx.userInterest.deleteMany({ where: { userId } });
      if (dto.interestIds.length) {
        await tx.userInterest.createMany({
          data: dto.interestIds.map((interestId) => ({ userId, interestId })),
          skipDuplicates: true,
        });
      }
    });

    return this.get(userId);
  }
}

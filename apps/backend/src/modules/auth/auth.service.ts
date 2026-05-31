import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { compare, hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@spotwave/database';
import { DatabaseService } from '../../core/database/database.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.db.client.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    const passwordHash = await hash(dto.password, 10);
    const displayName = dto.name?.trim() || dto.email.split('@')[0];

    const user = await this.db.client.user.create({
      data: {
        firebaseUid: `local-${randomUUID()}`,
        email: dto.email,
        password: passwordHash,
        displayName,
        role: UserRole.USER,
        profile: {
          create: {
            displayName,
          },
        },
      },
      select: { id: true, email: true, role: true },
    });

    return {
      accessToken: await this.signAccessToken(user.id, user.email, user.role),
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.db.client.user.findUnique({
      where: { email: dto.email },
      select: { id: true, email: true, password: true, role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'Password login is not available for this user',
      );
    }

    const isPasswordValid = await compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      accessToken: await this.signAccessToken(user.id, user.email, user.role),
    };
  }

  async getMe(userId: string) {
    const user = await this.db.client.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        role: true,
        profile: {
          select: {
            displayName: true,
            avatarUrl: true,
            bio: true,
            homeLat: true,
            homeLng: true,
            radiusKm: true,
          },
        },
        interests: {
          select: {
            interest: {
              select: {
                id: true,
                name: true,
                slug: true,
                icon: true,
              },
            },
          },
        },
        createdEvents: {
          select: {
            id: true,
            title: true,
            startsAt: true,
            capacity: true,
            participants: {
              select: {
                status: true,
              },
            },
            reviews: {
              select: {
                rating: true,
                text: true,
                createdAt: true,
                author: {
                  select: {
                    displayName: true,
                    email: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
              take: 3,
            },
          },
          orderBy: { startsAt: 'desc' },
        },
        eventParticipants: {
          select: {
            status: true,
            event: {
              select: {
                id: true,
                title: true,
                startsAt: true,
                addressText: true,
              },
            },
          },
          orderBy: { joinedAt: 'desc' },
        },
        eventCheckIns: {
          select: {
            id: true,
            method: true,
            createdAt: true,
          },
        },
        reportsAgainstMe: {
          select: { id: true, status: true },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return null;

    const hostedEventsCount = user.createdEvents.length;
    const joinedEventsCount = user.eventParticipants.length;
    const checkInsCount = user.eventCheckIns.length;
    const reviews = user.createdEvents.flatMap((event) =>
      event.reviews.map((review) => ({
        eventId: event.id,
        eventTitle: event.title,
        rating: review.rating,
        text: review.text,
        createdAt: review.createdAt,
        authorName: review.author.displayName ?? review.author.email,
      })),
    );
    const averageRating =
      reviews.length > 0
        ? Number(
            (
              reviews.reduce((sum, review) => sum + review.rating, 0) /
              reviews.length
            ).toFixed(1),
          )
        : null;
    const resolvedReports = user.reportsAgainstMe.filter(
      (report) => report.status === 'RESOLVED',
    ).length;
    const openReports = user.reportsAgainstMe.length - resolvedReports;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      profile: user.profile
        ? {
            displayName: user.profile.displayName,
            avatarUrl: user.profile.avatarUrl,
            bio: user.profile.bio,
            homeLat: user.profile.homeLat ? Number(user.profile.homeLat) : null,
            homeLng: user.profile.homeLng ? Number(user.profile.homeLng) : null,
            radiusKm: user.profile.radiusKm,
          }
        : null,
      interests: user.interests.map((item) => item.interest),
      activity: {
        hostedEventsCount,
        joinedEventsCount,
        checkInsCount,
        upcomingEvents: user.eventParticipants
          .slice(0, 4)
          .map((participant) => ({
            id: participant.event.id,
            title: participant.event.title,
            startsAt: participant.event.startsAt,
            addressText: participant.event.addressText,
            status: participant.status,
          })),
      },
      trust: {
        level:
          checkInsCount >= 4 && averageRating && averageRating >= 4.7
            ? '25+'
            : '18+',
        averageRating,
        reviewsCount: reviews.length,
        checkInsCount,
        hostedEventsCount,
        joinedEventsCount,
        openReports,
        resolvedReports,
        recentReviews: reviews.slice(0, 3),
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async refresh(userId: string): Promise<AuthResponseDto> {
    const user = await this.db.client.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    return {
      accessToken: await this.signAccessToken(user.id, user.email, user.role),
    };
  }

  private signAccessToken(userId: string, email: string, role: string) {
    return this.jwtService.signAsync({
      sub: userId,
      email,
      role,
    });
  }
}

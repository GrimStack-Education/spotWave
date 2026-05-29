import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EventStatus,
  MemberStatus,
  NotificationType,
  ParticipantRole,
  ParticipantStatus,
  Prisma,
} from '@spotwave/database';
import { DatabaseService } from '../../core/database/database.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateEventDto } from './dto/create-event.dto';
import { GetEventsQueryDto } from './dto/get-events-query.dto';
import { UpdateEventDto } from './dto/update-event.dto';

const EVENT_INCLUDE = {
  creator: {
    select: {
      id: true,
      email: true,
      role: true,
      displayName: true,
      avatarUrl: true,
      profile: {
        select: {
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  },
  eventTags: {
    include: {
      tag: true,
    },
  },
  participants: {
    orderBy: {
      joinedAt: 'asc',
    },
    select: {
      userId: true,
      role: true,
      status: true,
      joinedAt: true,
      user: {
        select: {
          id: true,
          email: true,
          displayName: true,
          avatarUrl: true,
          profile: {
            select: {
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  },
  community: {
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      city: true,
    },
  },
} satisfies Prisma.EventInclude;

type EventWithRelations = Prisma.EventGetPayload<{
  include: typeof EVENT_INCLUDE;
}>;

@Injectable()
export class EventsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(query: GetEventsQueryDto) {
    if ((query.lat === undefined) !== (query.lng === undefined)) {
      throw new BadRequestException('lat and lng must be provided together');
    }

    if (
      query.radiusKm !== undefined &&
      (query.lat === undefined || query.lng === undefined)
    ) {
      throw new BadRequestException('radiusKm requires lat and lng');
    }

    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;
    const where = this.buildWhere(query);

    const records = await this.db.client.event.findMany({
      where,
      include: EVENT_INCLUDE,
      orderBy: {
        startsAt: 'asc',
      },
    });

    const withDistance = records
      .map((record) => {
        const distanceKm =
          query.lat !== undefined && query.lng !== undefined
            ? this.calculateDistanceKm(
                query.lat,
                query.lng,
                this.toNumber(record.lat),
                this.toNumber(record.lng),
              )
            : null;

        return {
          record,
          distanceKm,
        };
      })
      .filter(
        (item) =>
          item.distanceKm === null ||
          query.radiusKm === undefined ||
          item.distanceKm <= query.radiusKm,
      )
      .sort((left, right) => {
        if (left.distanceKm !== null && right.distanceKm !== null) {
          if (left.distanceKm !== right.distanceKm) {
            return left.distanceKm - right.distanceKm;
          }
        }

        if (left.distanceKm !== null && right.distanceKm === null) {
          return -1;
        }

        if (left.distanceKm === null && right.distanceKm !== null) {
          return 1;
        }

        return left.record.startsAt.getTime() - right.record.startsAt.getTime();
      });

    const items = withDistance
      .slice(offset, offset + limit)
      .map((item) => this.mapEvent(item.record, item.distanceKm));

    return {
      count: items.length,
      events: items,
      items,
      total: withDistance.length,
      limit,
      offset,
    };
  }

  async findOne(eventId: string) {
    const event = await this.db.client.event.findUnique({
      where: { id: eventId },
      include: EVENT_INCLUDE,
    });

    if (!event) {
      throw new NotFoundException(`Event with id "${eventId}" was not found`);
    }

    return this.mapEvent(event);
  }

  async create(userId: string, dto: CreateEventDto) {
    await this.ensureUserExists(userId);
    this.validateEventDates(dto.startsAt, dto.endsAt);
    const tagIds = await this.ensureTagsExist(dto.tagIds);
    const communityId = dto.communityId
      ? await this.ensureCanAttachCommunity(dto.communityId, userId)
      : null;

    const event = await this.db.client.event.create({
      data: {
        creatorId: userId,
        communityId,
        title: dto.title.trim(),
        description: dto.description?.trim(),
        startsAt: new Date(dto.startsAt),
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        visibility: dto.visibility,
        capacity: dto.capacity,
        imageUrl: dto.imageUrl?.trim(),
        lat: new Prisma.Decimal(dto.lat),
        lng: new Prisma.Decimal(dto.lng),
        addressText: dto.addressText?.trim(),
        participants: {
          create: {
            userId,
            role: ParticipantRole.HOST,
            status: ParticipantStatus.JOINED,
          },
        },
        eventTags: tagIds.length
          ? {
              create: tagIds.map((tagId) => ({
                tagId,
              })),
            }
          : undefined,
      },
      include: EVENT_INCLUDE,
    });

    return this.mapEvent(event);
  }

  async update(
    eventId: string,
    userId: string,
    userRole: string,
    dto: UpdateEventDto,
  ) {
    const event = await this.db.client.event.findUnique({
      where: { id: eventId },
      include: {
        eventTags: {
          select: { tagId: true },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with id "${eventId}" was not found`);
    }

    this.assertCanModify(event.creatorId, userId, userRole);
    this.validateEventDates(
      dto.startsAt ?? event.startsAt.toISOString(),
      dto.endsAt !== undefined ? dto.endsAt : event.endsAt?.toISOString(),
    );

    const tagIds =
      dto.tagIds !== undefined ? await this.ensureTagsExist(dto.tagIds) : null;
    const communityId =
      dto.communityId !== undefined
        ? await this.ensureCanAttachCommunity(dto.communityId, userId)
        : undefined;

    await this.db.client.$transaction(async (tx) => {
      await tx.event.update({
        where: { id: eventId },
        data: {
          communityId,
          title: dto.title?.trim(),
          description:
            dto.description !== undefined ? dto.description.trim() : undefined,
          startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
          endsAt:
            dto.endsAt !== undefined
              ? dto.endsAt
                ? new Date(dto.endsAt)
                : null
              : undefined,
          visibility: dto.visibility,
          capacity: dto.capacity,
          imageUrl:
            dto.imageUrl !== undefined ? dto.imageUrl.trim() : undefined,
          lat: dto.lat !== undefined ? new Prisma.Decimal(dto.lat) : undefined,
          lng: dto.lng !== undefined ? new Prisma.Decimal(dto.lng) : undefined,
          addressText:
            dto.addressText !== undefined ? dto.addressText.trim() : undefined,
        },
      });

      if (tagIds !== null) {
        await tx.eventTag.deleteMany({ where: { eventId } });

        if (tagIds.length) {
          await tx.eventTag.createMany({
            data: tagIds.map((tagId) => ({
              eventId,
              tagId,
            })),
            skipDuplicates: true,
          });
        }
      }
    });

    return this.findOne(eventId);
  }

  async remove(eventId: string, userId: string, userRole: string) {
    const event = await this.db.client.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        creatorId: true,
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with id "${eventId}" was not found`);
    }

    this.assertCanModify(event.creatorId, userId, userRole);

    await this.db.client.event.update({
      where: { id: eventId },
      data: {
        status: EventStatus.CANCELLED,
      },
    });

    return this.findOne(eventId);
  }

  async join(eventId: string, userId: string) {
    const event = await this.db.client.event.findUnique({
      where: { id: eventId },
      include: {
        participants: {
          orderBy: {
            joinedAt: 'asc',
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with id "${eventId}" was not found`);
    }

    if (
      event.status === EventStatus.CANCELLED ||
      event.status === EventStatus.FINISHED
    ) {
      throw new ConflictException('Cannot join cancelled or finished event');
    }

    const existingParticipant = event.participants.find(
      (participant) => participant.userId === userId,
    );

    if (
      existingParticipant &&
      existingParticipant.status !== ParticipantStatus.LEFT
    ) {
      throw new ConflictException('User already participates in this event');
    }

    const joinedMembers = event.participants.filter(
      (participant) =>
        participant.role === ParticipantRole.MEMBER &&
        participant.status === ParticipantStatus.JOINED,
    ).length;

    const nextStatus =
      event.capacity !== null &&
      event.capacity !== undefined &&
      joinedMembers >= event.capacity
        ? ParticipantStatus.WAITLIST
        : ParticipantStatus.JOINED;

    const participant = existingParticipant
      ? await this.db.client.eventParticipant.update({
          where: {
            eventId_userId: {
              eventId,
              userId,
            },
          },
          data: {
            status: nextStatus,
            role: ParticipantRole.MEMBER,
            joinedAt: new Date(),
          },
        })
      : await this.db.client.eventParticipant.create({
          data: {
            eventId,
            userId,
            role: ParticipantRole.MEMBER,
            status: nextStatus,
          },
        });

    if (nextStatus === ParticipantStatus.WAITLIST) {
      await this.notificationsService.push({
        userId,
        type: NotificationType.EVENT_JOIN_REQUEST,
        title: 'Join request received',
        body: 'Your request is pending host approval',
        meta: { eventId },
      });
    }

    return {
      eventId: participant.eventId,
      userId: participant.userId,
      role: participant.role,
      status: participant.status,
      joinedAt: participant.joinedAt,
    };
  }

  async leave(eventId: string, userId: string) {
    const eventExists = await this.db.client.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });

    if (!eventExists) {
      throw new NotFoundException(`Event with id "${eventId}" was not found`);
    }

    const participant = await this.db.client.eventParticipant.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (!participant || participant.status === ParticipantStatus.LEFT) {
      throw new ConflictException('User is not an active participant');
    }

    if (participant.role === ParticipantRole.HOST) {
      throw new ConflictException('Host cannot leave their own event');
    }

    const result = await this.db.client.$transaction(async (tx) => {
      const updated = await tx.eventParticipant.update({
        where: {
          eventId_userId: {
            eventId,
            userId,
          },
        },
        data: {
          status: ParticipantStatus.LEFT,
        },
      });

      if (participant.status === ParticipantStatus.JOINED) {
        const waitlistParticipant = await tx.eventParticipant.findFirst({
          where: {
            eventId,
            status: ParticipantStatus.WAITLIST,
          },
          orderBy: {
            joinedAt: 'asc',
          },
        });

        if (waitlistParticipant) {
          await tx.eventParticipant.update({
            where: {
              eventId_userId: {
                eventId: waitlistParticipant.eventId,
                userId: waitlistParticipant.userId,
              },
            },
            data: {
              status: ParticipantStatus.JOINED,
            },
          });
        }
      }

      return updated;
    });

    return {
      eventId: result.eventId,
      userId: result.userId,
      role: result.role,
      status: result.status,
      joinedAt: result.joinedAt,
    };
  }

  async listJoinRequests(eventId: string, userId: string, userRole: string) {
    await this.assertCanModifyEventParticipants(eventId, userId, userRole);
    const items = await this.db.client.eventParticipant.findMany({
      where: {
        eventId,
        role: ParticipantRole.MEMBER,
        status: ParticipantStatus.WAITLIST,
      },
      include: {
        user: {
          select: { id: true, email: true, displayName: true },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    return { items };
  }

  async approveJoinRequest(
    eventId: string,
    targetUserId: string,
    userId: string,
    userRole: string,
  ) {
    await this.assertCanModifyEventParticipants(eventId, userId, userRole);
    const participant = await this.db.client.eventParticipant.findUnique({
      where: { eventId_userId: { eventId, userId: targetUserId } },
    });
    if (!participant || participant.status !== ParticipantStatus.WAITLIST) {
      throw new NotFoundException('Join request not found');
    }

    const event = await this.db.client.event.findUnique({
      where: { id: eventId },
      include: {
        participants: {
          select: {
            role: true,
            status: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with id "${eventId}" was not found`);
    }

    if (event.capacity !== null && event.capacity !== undefined) {
      const joinedMembers = event.participants.filter(
        (item) =>
          item.role === ParticipantRole.MEMBER &&
          item.status === ParticipantStatus.JOINED,
      ).length;

      if (joinedMembers >= event.capacity) {
        throw new ConflictException('Event capacity is already full');
      }
    }

    const updated = await this.db.client.eventParticipant.update({
      where: { eventId_userId: { eventId, userId: targetUserId } },
      data: { status: ParticipantStatus.JOINED },
    });

    await this.notificationsService.push({
      userId: targetUserId,
      type: NotificationType.EVENT_JOIN_APPROVED,
      title: 'Join request approved',
      body: 'Host approved your participation request',
      meta: { eventId },
    });

    return updated;
  }

  async rejectJoinRequest(
    eventId: string,
    targetUserId: string,
    userId: string,
    userRole: string,
  ) {
    await this.assertCanModifyEventParticipants(eventId, userId, userRole);
    const participant = await this.db.client.eventParticipant.findUnique({
      where: { eventId_userId: { eventId, userId: targetUserId } },
    });
    if (!participant || participant.status !== ParticipantStatus.WAITLIST) {
      throw new NotFoundException('Join request not found');
    }

    const updated = await this.db.client.eventParticipant.update({
      where: { eventId_userId: { eventId, userId: targetUserId } },
      data: { status: ParticipantStatus.LEFT },
    });

    await this.notificationsService.push({
      userId: targetUserId,
      type: NotificationType.EVENT_JOIN_REJECTED,
      title: 'Join request rejected',
      body: 'Host rejected your participation request',
      meta: { eventId },
    });

    return updated;
  }

  private buildWhere(query: GetEventsQueryDto): Prisma.EventWhereInput {
    const where: Prisma.EventWhereInput = {
      status: query.status ?? EventStatus.ACTIVE,
    };

    if (query.startsFrom || query.startsTo) {
      where.startsAt = {};

      if (query.startsFrom) {
        where.startsAt.gte = new Date(query.startsFrom);
      }

      if (query.startsTo) {
        where.startsAt.lte = new Date(query.startsTo);
      }
    }

    if (query.tag) {
      where.eventTags = {
        some: {
          tag: {
            OR: [{ slug: query.tag }, { id: query.tag }],
          },
        },
      };
    }

    if (
      query.lat !== undefined &&
      query.lng !== undefined &&
      query.radiusKm !== undefined
    ) {
      const latitudeDelta = query.radiusKm / 111.32;
      const longitudeDelta =
        query.radiusKm /
        (111.32 * Math.max(Math.cos((query.lat * Math.PI) / 180), 0.01));

      where.lat = {
        gte: new Prisma.Decimal(query.lat - latitudeDelta),
        lte: new Prisma.Decimal(query.lat + latitudeDelta),
      };

      where.lng = {
        gte: new Prisma.Decimal(query.lng - longitudeDelta),
        lte: new Prisma.Decimal(query.lng + longitudeDelta),
      };
    }

    return where;
  }

  private mapEvent(event: EventWithRelations, distanceKm?: number | null) {
    const joinedParticipants = event.participants.filter(
      (participant) => participant.status === ParticipantStatus.JOINED,
    );
    const joinedMembers = joinedParticipants.filter(
      (participant) => participant.role === ParticipantRole.MEMBER,
    );
    const hosts = joinedParticipants.filter(
      (participant) => participant.role === ParticipantRole.HOST,
    );
    const waitlistParticipants = event.participants.filter(
      (participant) => participant.status === ParticipantStatus.WAITLIST,
    );
    const seatsLeft =
      event.capacity !== null
        ? Math.max(event.capacity - joinedMembers.length, 0)
        : null;

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      status: event.status,
      visibility: event.visibility,
      capacity: event.capacity,
      imageUrl: event.imageUrl,
      lat: this.toNumber(event.lat),
      lng: this.toNumber(event.lng),
      locationName: event.community?.name ?? event.addressText ?? null,
      address: event.addressText ?? null,
      addressText: event.addressText,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      distanceKm:
        distanceKm !== undefined && distanceKm !== null
          ? Number(distanceKm.toFixed(3))
          : null,
      creator: {
        id: event.creator.id,
        email: event.creator.email,
        role: event.creator.role,
        displayName:
          event.creator.profile?.displayName ?? event.creator.displayName,
        avatarUrl:
          event.creator.profile?.avatarUrl ?? event.creator.avatarUrl ?? null,
      },
      community: event.community,
      tags: event.eventTags.map((eventTag) => ({
        id: eventTag.tag.id,
        slug: eventTag.tag.slug,
        name: eventTag.tag.name,
      })),
      participants: {
        joinedCount: joinedParticipants.length,
        memberJoinedCount: joinedMembers.length,
        hostCount: hosts.length,
        waitlistCount: waitlistParticipants.length,
        seatsLeft,
        items: event.participants.map((participant) => ({
          userId: participant.userId,
          role: participant.role,
          status: participant.status,
          joinedAt: participant.joinedAt,
          user: {
            id: participant.user.id,
            email: participant.user.email,
            displayName:
              participant.user.profile?.displayName ??
              participant.user.displayName,
            avatarUrl:
              participant.user.profile?.avatarUrl ??
              participant.user.avatarUrl ??
              null,
          },
        })),
      },
    };
  }

  private async ensureTagsExist(tagIds?: string[]) {
    const uniqueTagIds = [...new Set(tagIds ?? [])];

    if (uniqueTagIds.length === 0) {
      return [];
    }

    const tags = await this.db.client.tag.findMany({
      where: {
        id: {
          in: uniqueTagIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (tags.length !== uniqueTagIds.length) {
      throw new BadRequestException('One or more tags do not exist');
    }

    return uniqueTagIds;
  }

  private async ensureUserExists(userId: string) {
    const user = await this.db.client.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${userId}" was not found`);
    }
  }

  private async ensureCanAttachCommunity(communityId: string, userId: string) {
    const community = await this.db.client.community.findUnique({
      where: { id: communityId },
      select: {
        id: true,
        members: {
          where: { userId, status: MemberStatus.ACTIVE },
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!community) {
      throw new NotFoundException(
        `Community with id "${communityId}" was not found`,
      );
    }

    if (community.members.length === 0) {
      throw new ForbiddenException(
        'Only active community members can attach events to this community',
      );
    }

    return community.id;
  }

  private assertCanModify(creatorId: string, userId: string, userRole: string) {
    if (creatorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'Only creator or admin can modify this event',
      );
    }
  }

  private async assertCanModifyEventParticipants(
    eventId: string,
    userId: string,
    userRole: string,
  ) {
    const event = await this.db.client.event.findUnique({
      where: { id: eventId },
      select: { creatorId: true },
    });

    if (!event) {
      throw new NotFoundException(`Event with id "${eventId}" was not found`);
    }

    this.assertCanModify(event.creatorId, userId, userRole);
  }

  private validateEventDates(startsAt: string, endsAt?: string | null) {
    if (!endsAt) {
      return;
    }

    if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
      throw new BadRequestException('endsAt must be greater than startsAt');
    }
  }

  private toNumber(value: Prisma.Decimal | number) {
    return Number(value);
  }

  private calculateDistanceKm(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
  ) {
    const earthRadiusKm = 6371;
    const dLat = this.degreesToRadians(toLat - fromLat);
    const dLng = this.degreesToRadians(toLng - fromLng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(fromLat)) *
        Math.cos(this.degreesToRadians(toLat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private degreesToRadians(value: number) {
    return (value * Math.PI) / 180;
  }
}

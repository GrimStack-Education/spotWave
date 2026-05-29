import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CommunityVisibility,
  EventStatus,
  MemberRole,
  MemberStatus,
  ParticipantRole,
  ParticipantStatus,
  Prisma,
} from '@spotwave/database';
import { DatabaseService } from '../../core/database/database.service';
import { CommunitiesGateway } from './communities.gateway';
import { CreateCommunityDto } from './dto/create-community.dto';
import { CreateCommunityMessageDto } from './dto/create-community-message.dto';
import { GetCommunitiesQueryDto } from './dto/get-communities-query.dto';

const COMMUNITY_INCLUDE = {
  owner: {
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
  members: {
    select: {
      id: true,
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
        },
      },
    },
    orderBy: {
      joinedAt: 'asc',
    },
  },
  events: {
    where: {
      status: EventStatus.ACTIVE,
    },
    orderBy: {
      startsAt: 'asc',
    },
    select: {
      id: true,
      title: true,
      description: true,
      startsAt: true,
      endsAt: true,
      status: true,
      visibility: true,
      capacity: true,
      lat: true,
      lng: true,
      addressText: true,
      participants: {
        select: {
          role: true,
          status: true,
        },
      },
      eventTags: {
        include: {
          tag: true,
        },
      },
    },
  },
} satisfies Prisma.CommunityInclude;

type CommunityWithRelations = Prisma.CommunityGetPayload<{
  include: typeof COMMUNITY_INCLUDE;
}>;

@Injectable()
export class CommunitiesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly gateway: CommunitiesGateway,
  ) {}

  async list(query: GetCommunitiesQueryDto) {
    const limit = query.limit ?? 30;
    const offset = query.offset ?? 0;
    const where: Prisma.CommunityWhereInput = {
      visibility: CommunityVisibility.PUBLIC,
      ...(query.city
        ? { city: { contains: query.city, mode: 'insensitive' } }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.db.client.community.findMany({
        where,
        include: COMMUNITY_INCLUDE,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.db.client.community.count({ where }),
    ]);

    return {
      items: items.map((community) => this.mapCommunity(community)),
      total,
      limit,
      offset,
    };
  }

  async findOne(communityId: string) {
    const community = await this.db.client.community.findUnique({
      where: { id: communityId },
      include: COMMUNITY_INCLUDE,
    });

    if (!community) {
      throw new NotFoundException(
        `Community with id "${communityId}" was not found`,
      );
    }

    return this.mapCommunity(community);
  }

  async create(userId: string, dto: CreateCommunityDto) {
    await this.ensureUserExists(userId);

    const community = await this.db.client.community.create({
      data: {
        name: dto.name.trim(),
        description: dto.description.trim(),
        avatarUrl:
          dto.avatarUrl?.trim() ||
          `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(dto.name.trim())}`,
        city: dto.city.trim(),
        visibility: dto.visibility ?? CommunityVisibility.PUBLIC,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: MemberRole.OWNER,
            status: MemberStatus.ACTIVE,
          },
        },
      },
      include: COMMUNITY_INCLUDE,
    });

    return this.mapCommunity(community);
  }

  async join(communityId: string, userId: string) {
    const community = await this.db.client.community.findUnique({
      where: { id: communityId },
      select: { id: true, visibility: true },
    });

    if (!community) {
      throw new NotFoundException(
        `Community with id "${communityId}" was not found`,
      );
    }

    if (community.visibility !== CommunityVisibility.PUBLIC) {
      throw new ConflictException(
        'Only public communities can be joined directly',
      );
    }

    const existing = await this.db.client.communityMember.findUnique({
      where: { communityId_userId: { communityId, userId } },
    });

    if (existing?.status === MemberStatus.BANNED) {
      throw new ForbiddenException('User cannot join this community');
    }

    if (existing?.status === MemberStatus.ACTIVE) {
      return this.mapMember(existing);
    }

    const member = existing
      ? await this.db.client.communityMember.update({
          where: { id: existing.id },
          data: {
            role:
              existing.role === MemberRole.OWNER
                ? MemberRole.OWNER
                : MemberRole.MEMBER,
            status: MemberStatus.ACTIVE,
            joinedAt: new Date(),
          },
        })
      : await this.db.client.communityMember.create({
          data: {
            communityId,
            userId,
            role: MemberRole.MEMBER,
            status: MemberStatus.ACTIVE,
          },
        });

    return this.mapMember(member);
  }

  async leave(communityId: string, userId: string) {
    const community = await this.db.client.community.findUnique({
      where: { id: communityId },
      select: { id: true, ownerId: true },
    });

    if (!community) {
      throw new NotFoundException(
        `Community with id "${communityId}" was not found`,
      );
    }

    if (community.ownerId === userId) {
      throw new ConflictException('Owner cannot leave their own community');
    }

    const member = await this.db.client.communityMember.findUnique({
      where: { communityId_userId: { communityId, userId } },
    });

    if (!member || member.status !== MemberStatus.ACTIVE) {
      throw new ConflictException('User is not an active community member');
    }

    const updated = await this.db.client.communityMember.update({
      where: { id: member.id },
      data: { status: MemberStatus.LEFT },
    });

    return this.mapMember(updated);
  }

  async listMessages(communityId: string, userId: string) {
    await this.assertActiveMember(communityId, userId);

    const items = await this.db.client.communityChatMessage.findMany({
      where: { communityId },
      include: {
        user: {
          select: { id: true, email: true, displayName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 300,
    });

    return { items: items.map((message) => this.mapMessage(message)) };
  }

  async sendMessage(
    communityId: string,
    userId: string,
    dto: CreateCommunityMessageDto,
  ) {
    await this.assertActiveMember(communityId, userId);

    const message = await this.db.client.communityChatMessage.create({
      data: {
        communityId,
        userId,
        message: dto.message.trim(),
      },
      include: {
        user: {
          select: { id: true, email: true, displayName: true, avatarUrl: true },
        },
      },
    });
    const mapped = this.mapMessage(message);
    this.gateway.emitMessage(mapped);
    return mapped;
  }

  private async assertActiveMember(communityId: string, userId: string) {
    const community = await this.db.client.community.findUnique({
      where: { id: communityId },
      select: { id: true },
    });

    if (!community) {
      throw new NotFoundException(
        `Community with id "${communityId}" was not found`,
      );
    }

    const member = await this.db.client.communityMember.findUnique({
      where: { communityId_userId: { communityId, userId } },
      select: { status: true },
    });

    if (!member || member.status !== MemberStatus.ACTIVE) {
      throw new ForbiddenException(
        'Only active members can access community chat',
      );
    }
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

  private mapCommunity(community: CommunityWithRelations) {
    const activeMembers = community.members.filter(
      (member) => member.status === MemberStatus.ACTIVE,
    );

    return {
      id: community.id,
      name: community.name,
      description: community.description,
      avatarUrl: community.avatarUrl,
      city: community.city,
      visibility: community.visibility,
      owner: {
        id: community.owner.id,
        email: community.owner.email,
        displayName:
          community.owner.profile?.displayName ?? community.owner.displayName,
        avatarUrl:
          community.owner.profile?.avatarUrl ??
          community.owner.avatarUrl ??
          null,
      },
      members: {
        activeCount: activeMembers.length,
        items: community.members.map((member) => ({
          id: member.id,
          userId: member.userId,
          role: member.role,
          status: member.status,
          joinedAt: member.joinedAt,
          user: member.user,
        })),
      },
      events: {
        items: community.events.map((event) => {
          const joinedMembers = event.participants.filter(
            (participant) =>
              participant.role === ParticipantRole.MEMBER &&
              participant.status === ParticipantStatus.JOINED,
          );
          const waitlistParticipants = event.participants.filter(
            (participant) => participant.status === ParticipantStatus.WAITLIST,
          );

          return {
            id: event.id,
            title: event.title,
            description: event.description,
            startsAt: event.startsAt,
            endsAt: event.endsAt,
            status: event.status,
            visibility: event.visibility,
            capacity: event.capacity,
            lat: Number(event.lat),
            lng: Number(event.lng),
            addressText: event.addressText,
            tags: event.eventTags.map((eventTag) => ({
              id: eventTag.tag.id,
              slug: eventTag.tag.slug,
              name: eventTag.tag.name,
            })),
            participants: {
              memberJoinedCount: joinedMembers.length,
              waitlistCount: waitlistParticipants.length,
              seatsLeft:
                event.capacity !== null
                  ? Math.max(event.capacity - joinedMembers.length, 0)
                  : null,
            },
          };
        }),
      },
      createdAt: community.createdAt,
      updatedAt: community.updatedAt,
    };
  }

  private mapMember(member: {
    id: string;
    communityId: string;
    userId: string;
    role: MemberRole;
    status: MemberStatus;
    joinedAt: Date;
  }) {
    return {
      id: member.id,
      communityId: member.communityId,
      userId: member.userId,
      role: member.role,
      status: member.status,
      joinedAt: member.joinedAt,
    };
  }

  private mapMessage(message: {
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
  }) {
    return {
      id: message.id,
      communityId: message.communityId,
      message: message.message,
      createdAt: message.createdAt,
      user: message.user,
    };
  }
}

import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import {
	CommunityVisibility,
	MemberRole,
	MemberStatus,
	PrismaClient,
	ReportSeverity,
	ReportStatus,
	UserRole
} from "./generated/prisma/client.ts";

const defaultDatabaseUrl = "postgresql://spotwave:changeme@localhost:5432/spotwave";
const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL ?? defaultDatabaseUrl
});
const prisma = new PrismaClient({ adapter });

const categoryData = [
	{ name: "Music", slug: "music", icon: "music" },
	{ name: "Sports", slug: "sports", icon: "sports" },
	{ name: "Cinema", slug: "cinema", icon: "cinema" },
	{ name: "Theater", slug: "theater", icon: "theater" },
	{ name: "Exhibitions", slug: "exhibitions", icon: "exhibitions" },
	{ name: "Conferences", slug: "conferences", icon: "conferences" },
	{ name: "Workshops", slug: "workshops", icon: "workshops" },
	{ name: "Nightlife", slug: "nightlife", icon: "nightlife" }
];

const interestData = [
	{ name: "Live Music", slug: "live-music", icon: "music" },
	{ name: "Running", slug: "running", icon: "sports" },
	{ name: "Cinema Nights", slug: "cinema-nights", icon: "cinema" },
	{ name: "Art Exhibits", slug: "art-exhibits", icon: "exhibitions" },
	{ name: "Tech Talks", slug: "tech-talks", icon: "conferences" },
	{ name: "Street Food", slug: "street-food", icon: "food" },
	{ name: "Travel", slug: "travel", icon: "travel" },
	{ name: "Photography", slug: "photography", icon: "photo" },
	{ name: "Design", slug: "design", icon: "design" },
	{ name: "Wellness", slug: "wellness", icon: "wellness" }
];

const organizationData = [
	{
		name: "Pulse Media",
		description: "Media network focused on live culture and city events.",
		industry: "Media",
		contactEmail: "hello@pulsemedia.com",
		isVerified: true
	},
	{
		name: "StageCraft Agency",
		description: "Event production agency for concerts and showcases.",
		industry: "Events",
		contactEmail: "team@stagecraft.agency",
		isVerified: true
	},
	{
		name: "Northwind Brand",
		description: "Lifestyle brand that partners with community events.",
		industry: "Brand",
		contactEmail: "partners@northwind.example",
		isVerified: false
	}
];

const userData = [
	{
		email: "admin@spotwave.test",
		firebaseUid: "uid_admin_001",
		displayName: "Platform Admin",
		avatarUrl: "https://cdn.example.com/avatars/admin.png",
		bio: "Keeps the platform safe and organized.",
		role: UserRole.ADMIN
	},
	{
		email: "moderator@spotwave.test",
		firebaseUid: "uid_mod_001",
		displayName: "Community Mod",
		avatarUrl: "https://cdn.example.com/avatars/mod.png",
		bio: "Moderates reports and keeps communities healthy.",
		role: UserRole.MODERATOR
	},
	{
		email: "b2b@pulsemedia.com",
		firebaseUid: "uid_b2b_001",
		displayName: "Pulse Media Team",
		avatarUrl: "https://cdn.example.com/avatars/pulse.png",
		bio: "Publishes weekly culture picks.",
		role: UserRole.B2B_ADMIN,
		organizationName: "Pulse Media"
	},
	{
		email: "events@stagecraft.agency",
		firebaseUid: "uid_b2b_002",
		displayName: "StageCraft Ops",
		avatarUrl: "https://cdn.example.com/avatars/stagecraft.png",
		bio: "Coordinates venue partners and artists.",
		role: UserRole.B2B_ADMIN,
		organizationName: "StageCraft Agency"
	},
	{
		email: "lina@spotwave.test",
		firebaseUid: "uid_user_001",
		displayName: "Lina Rivera",
		avatarUrl: "https://cdn.example.com/avatars/lina.png",
		bio: "Loves indie music and city walks.",
		role: UserRole.USER
	},
	{
		email: "mike@spotwave.test",
		firebaseUid: "uid_user_002",
		displayName: "Mike Kwon",
		avatarUrl: "https://cdn.example.com/avatars/mike.png",
		bio: "Sports fan and weekend traveler.",
		role: UserRole.USER
	},
	{
		email: "daria@spotwave.test",
		firebaseUid: "uid_user_003",
		displayName: "Daria Volkova",
		avatarUrl: "https://cdn.example.com/avatars/daria.png",
		bio: "Finds the best workshops and talks.",
		role: UserRole.USER
	},
	{
		email: "sam@spotwave.test",
		firebaseUid: "uid_user_004",
		displayName: "Sam Patel",
		avatarUrl: "https://cdn.example.com/avatars/sam.png",
		bio: "Nightlife explorer and photographer.",
		role: UserRole.USER
	}
];

const venueData = [
	{
		name: "Atlas Hall",
		address: "12 River Ave, Downtown",
		coordinates: "55.7558,37.6173",
		capacity: 850
	},
	{
		name: "North Dock",
		address: "88 Harbor St, Riverside",
		coordinates: "55.7601,37.6100",
		capacity: 1200
	},
	{
		name: "Aurora Gallery",
		address: "5 Oak Blvd, Midtown",
		coordinates: "55.7512,37.6205",
		capacity: 300
	},
	{
		name: "Skyline Arena",
		address: "101 Skyline Rd, Uptown",
		coordinates: "55.7685,37.6290",
		capacity: 4200
	}
];

const communityData = [
	{
		name: "City Sounds",
		description: "Indie music lovers sharing local gigs.",
		avatarUrl: "https://cdn.example.com/communities/city-sounds.png",
		city: "Moscow",
		visibility: CommunityVisibility.PUBLIC,
		ownerEmail: "lina@spotwave.test"
	},
	{
		name: "Tech Meetups",
		description: "Talks, workshops, and networking nights.",
		avatarUrl: "https://cdn.example.com/communities/tech-meetups.png",
		city: "Moscow",
		visibility: CommunityVisibility.PUBLIC,
		ownerEmail: "daria@spotwave.test"
	},
	{
		name: "Night Owls",
		description: "Late-night events and city adventures.",
		avatarUrl: "https://cdn.example.com/communities/night-owls.png",
		city: "Moscow",
		visibility: CommunityVisibility.INVITE_ONLY,
		ownerEmail: "sam@spotwave.test"
	}
];

const communityMemberData = [
	{
		communityName: "City Sounds",
		userEmail: "lina@spotwave.test",
		role: MemberRole.OWNER,
		status: MemberStatus.ACTIVE,
		joinedAt: new Date("2026-04-10T10:00:00.000Z")
	},
	{
		communityName: "City Sounds",
		userEmail: "admin@spotwave.test",
		role: MemberRole.ADMIN,
		status: MemberStatus.ACTIVE,
		joinedAt: new Date("2026-04-10T10:05:00.000Z")
	},
	{
		communityName: "City Sounds",
		userEmail: "mike@spotwave.test",
		role: MemberRole.MEMBER,
		status: MemberStatus.ACTIVE,
		joinedAt: new Date("2026-04-12T14:00:00.000Z")
	},
	{
		communityName: "City Sounds",
		userEmail: "sam@spotwave.test",
		role: MemberRole.MEMBER,
		status: MemberStatus.PENDING,
		joinedAt: new Date("2026-04-20T18:00:00.000Z")
	},
	{
		communityName: "Tech Meetups",
		userEmail: "daria@spotwave.test",
		role: MemberRole.OWNER,
		status: MemberStatus.ACTIVE,
		joinedAt: new Date("2026-04-05T09:00:00.000Z")
	},
	{
		communityName: "Tech Meetups",
		userEmail: "admin@spotwave.test",
		role: MemberRole.ADMIN,
		status: MemberStatus.ACTIVE,
		joinedAt: new Date("2026-04-06T12:30:00.000Z")
	},
	{
		communityName: "Tech Meetups",
		userEmail: "lina@spotwave.test",
		role: MemberRole.MEMBER,
		status: MemberStatus.ACTIVE,
		joinedAt: new Date("2026-04-08T17:00:00.000Z")
	},
	{
		communityName: "Night Owls",
		userEmail: "sam@spotwave.test",
		role: MemberRole.OWNER,
		status: MemberStatus.ACTIVE,
		joinedAt: new Date("2026-04-02T20:00:00.000Z")
	},
	{
		communityName: "Night Owls",
		userEmail: "mike@spotwave.test",
		role: MemberRole.MODERATOR,
		status: MemberStatus.ACTIVE,
		joinedAt: new Date("2026-04-03T20:30:00.000Z")
	},
	{
		communityName: "Night Owls",
		userEmail: "daria@spotwave.test",
		role: MemberRole.MEMBER,
		status: MemberStatus.ACTIVE,
		joinedAt: new Date("2026-04-04T20:40:00.000Z")
	}
];

const userInterestData = [
	{ userEmail: "lina@spotwave.test", interestSlug: "live-music" },
	{ userEmail: "lina@spotwave.test", interestSlug: "cinema-nights" },
	{ userEmail: "mike@spotwave.test", interestSlug: "running" },
	{ userEmail: "mike@spotwave.test", interestSlug: "travel" },
	{ userEmail: "daria@spotwave.test", interestSlug: "tech-talks" },
	{ userEmail: "daria@spotwave.test", interestSlug: "design" },
	{ userEmail: "sam@spotwave.test", interestSlug: "photography" },
	{ userEmail: "sam@spotwave.test", interestSlug: "wellness" }
];

const eventData = [
	{
		firebaseEventId: "evt_0001",
		title: "City Sounds: Rooftop Session",
		description: "Live indie bands with sunset views.",
		startTime: new Date("2026-06-02T18:00:00.000Z"),
		endTime: new Date("2026-06-02T21:00:00.000Z"),
		creatorEmail: "lina@spotwave.test",
		categorySlug: "music",
		venueName: "Atlas Hall"
	},
	{
		firebaseEventId: "evt_0002",
		title: "Midnight Run Club",
		description: "Late evening run with music and coffee.",
		startTime: new Date("2026-06-05T19:30:00.000Z"),
		endTime: new Date("2026-06-05T21:00:00.000Z"),
		creatorEmail: "mike@spotwave.test",
		categorySlug: "sports",
		venueName: "North Dock"
	},
	{
		firebaseEventId: "evt_0003",
		title: "Film Night: City Stories",
		description: "Documentary screening with Q&A.",
		startTime: new Date("2026-06-08T17:00:00.000Z"),
		endTime: new Date("2026-06-08T19:00:00.000Z"),
		creatorEmail: "b2b@pulsemedia.com",
		categorySlug: "cinema",
		venueName: "Aurora Gallery"
	},
	{
		firebaseEventId: "evt_0004",
		title: "Design Workshop: Light & Space",
		description: "Hands-on workshop with guest designers.",
		startTime: new Date("2026-06-12T13:00:00.000Z"),
		endTime: new Date("2026-06-12T16:00:00.000Z"),
		creatorEmail: "daria@spotwave.test",
		categorySlug: "workshops",
		venueName: "Aurora Gallery"
	},
	{
		firebaseEventId: "evt_0005",
		title: "Tech Meetups: Build Night",
		description: "Lightning talks and project demos.",
		startTime: new Date("2026-06-15T17:30:00.000Z"),
		endTime: new Date("2026-06-15T20:30:00.000Z"),
		creatorEmail: "events@stagecraft.agency",
		categorySlug: "conferences",
		venueName: "Atlas Hall"
	},
	{
		firebaseEventId: "evt_0006",
		title: "Night Owls: After Hours",
		description: "Late-night DJ set and rooftop lounge.",
		startTime: new Date("2026-06-20T20:00:00.000Z"),
		endTime: new Date("2026-06-20T23:30:00.000Z"),
		creatorEmail: "sam@spotwave.test",
		categorySlug: "nightlife",
		venueName: "Skyline Arena"
	}
];

const reportData = [
	{
		id: "b2f99993-f6af-4eee-9f83-777777777771",
		reporterEmail: "lina@spotwave.test",
		targetType: "EVENT",
		targetRef: "evt_0002",
		severity: ReportSeverity.LOW,
		status: ReportStatus.PENDING
	},
	{
		id: "c30aaaa4-07b0-4fff-9f84-777777777772",
		reporterEmail: "mike@spotwave.test",
		targetType: "COMMUNITY",
		targetRef: "Night Owls",
		severity: ReportSeverity.MEDIUM,
		status: ReportStatus.INVESTIGATING
	},
	{
		id: "d41bbbb5-18c1-4000-9f85-777777777773",
		reporterEmail: "sam@spotwave.test",
		targetType: "EVENT",
		targetRef: "evt_0006",
		severity: ReportSeverity.HIGH,
		status: ReportStatus.PENDING
	}
];

const moderationActionData = [
	{
		id: "e52cccc6-29d2-4111-9f86-888888888881",
		reportId: "c30aaaa4-07b0-4fff-9f84-777777777772",
		moderatorEmail: "moderator@spotwave.test",
		action: "REQUEST_INFO",
		notes: "Asked owners for context and screenshots."
	},
	{
		id: "f63dddd7-3ae3-4222-9f87-888888888882",
		reportId: "d41bbbb5-18c1-4000-9f85-777777777773",
		moderatorEmail: "admin@spotwave.test",
		action: "WARN",
		notes: "Issued warning to organizer for late changes."
	}
];

async function main() {
	const defaultPassword = await hash("password123", 10);

	for (const category of categoryData) {
		await prisma.category.upsert({
			where: { slug: category.slug },
			update: { name: category.name, icon: category.icon },
			create: category
		});
	}

	for (const interest of interestData) {
		await prisma.interest.upsert({
			where: { slug: interest.slug },
			update: { name: interest.name, icon: interest.icon },
			create: interest
		});
	}

	const organizationsByName = new Map<string, string>();
	for (const organization of organizationData) {
		const existing = await prisma.organization.findFirst({
			where: {
				name: organization.name,
				contactEmail: organization.contactEmail
			}
		});
		const record = existing ?? (await prisma.organization.create({ data: organization }));
		organizationsByName.set(record.name, record.id);
	}

	const usersByEmail = new Map<string, string>();
	for (const user of userData) {
		const organizationId = user.organizationName
			? organizationsByName.get(user.organizationName)
			: null;
		const record = await prisma.user.upsert({
			where: { email: user.email },
			update: {
				firebaseUid: user.firebaseUid,
				password: defaultPassword,
				displayName: user.displayName,
				avatarUrl: user.avatarUrl,
				bio: user.bio,
				role: user.role,
				organizationId
			},
			create: {
				email: user.email,
				firebaseUid: user.firebaseUid,
				password: defaultPassword,
				displayName: user.displayName,
				avatarUrl: user.avatarUrl,
				bio: user.bio,
				role: user.role,
				organizationId
			}
		});
		usersByEmail.set(record.email, record.id);
	}

	const categoriesBySlug = new Map<string, string>();
	const categoryRecords = await prisma.category.findMany({
		where: { slug: { in: categoryData.map((item) => item.slug) } }
	});
	for (const category of categoryRecords) {
		categoriesBySlug.set(category.slug, category.id);
	}

	const interestsBySlug = new Map<string, string>();
	const interestRecords = await prisma.interest.findMany({
		where: { slug: { in: interestData.map((item) => item.slug) } }
	});
	for (const interest of interestRecords) {
		interestsBySlug.set(interest.slug, interest.id);
	}

	const venuesByName = new Map<string, string>();
	for (const venue of venueData) {
		const existing = await prisma.venue.findFirst({
			where: {
				name: venue.name,
				address: venue.address
			}
		});
		const record = existing ?? (await prisma.venue.create({ data: venue }));
		venuesByName.set(record.name, record.id);
	}

	const communitiesByName = new Map<string, string>();
	for (const community of communityData) {
		const ownerId = usersByEmail.get(community.ownerEmail);
		if (!ownerId) {
			throw new Error(`Missing owner user for community ${community.name}`);
		}
		const existing = await prisma.community.findFirst({
			where: {
				name: community.name,
				city: community.city
			}
		});
		const record = existing
			? await prisma.community.update({
					where: { id: existing.id },
					data: {
						description: community.description,
						avatarUrl: community.avatarUrl,
						visibility: community.visibility,
						ownerId
					}
				})
			: await prisma.community.create({
					data: {
						name: community.name,
						description: community.description,
						avatarUrl: community.avatarUrl,
						city: community.city,
						visibility: community.visibility,
						ownerId
					}
				});
		communitiesByName.set(record.name, record.id);
	}

	for (const membership of communityMemberData) {
		const communityId = communitiesByName.get(membership.communityName);
		const userId = usersByEmail.get(membership.userEmail);
		if (!communityId || !userId) {
			throw new Error(`Missing community/member for ${membership.communityName}`);
		}
		const existing = await prisma.communityMember.findFirst({
			where: { communityId, userId }
		});
		if (!existing) {
			await prisma.communityMember.create({
				data: {
					communityId,
					userId,
					role: membership.role,
					status: membership.status,
					joinedAt: membership.joinedAt
				}
			});
		}
	}

	const userInterests = userInterestData
		.map((item) => ({
			userId: usersByEmail.get(item.userEmail),
			interestId: interestsBySlug.get(item.interestSlug)
		}))
		.filter((item) => item.userId && item.interestId) as Array<{
			userId: string;
			interestId: string;
		}>;
	await prisma.userInterest.createMany({
		data: userInterests,
		skipDuplicates: true
	});

	const events = eventData.map((event) => {
		const creatorId = usersByEmail.get(event.creatorEmail);
		const categoryId = categoriesBySlug.get(event.categorySlug);
		const venueId = venuesByName.get(event.venueName);
		if (!creatorId || !categoryId || !venueId) {
			throw new Error(`Missing event dependencies for ${event.firebaseEventId}`);
		}
		return {
			firebaseEventId: event.firebaseEventId,
			title: event.title,
			description: event.description,
			startTime: event.startTime,
			endTime: event.endTime,
			creatorId,
			categoryId,
			venueId
		};
	});
	await prisma.eventArchive.createMany({
		data: events,
		skipDuplicates: true
	});

	const eventRecords = await prisma.eventArchive.findMany({
		where: { firebaseEventId: { in: eventData.map((item) => item.firebaseEventId) } }
	});
	const eventsByFirebaseId = new Map<string, string>();
	for (const event of eventRecords) {
		eventsByFirebaseId.set(event.firebaseEventId, event.id);
	}

	const reports = reportData.map((report) => {
		const reporterId = usersByEmail.get(report.reporterEmail);
		if (!reporterId) {
			throw new Error(`Missing reporter for report ${report.id}`);
		}
		const targetId =
			report.targetType === "EVENT"
				? eventsByFirebaseId.get(report.targetRef)
				: communitiesByName.get(report.targetRef);
		if (!targetId) {
			throw new Error(`Missing target for report ${report.id}`);
		}
		return {
			id: report.id,
			reporterId,
			targetType: report.targetType,
			targetId,
			severity: report.severity,
			status: report.status
		};
	});
	await prisma.report.createMany({
		data: reports,
		skipDuplicates: true
	});

	const moderationActions = moderationActionData.map((action) => {
		const moderatorId = usersByEmail.get(action.moderatorEmail);
		if (!moderatorId) {
			throw new Error(`Missing moderator for action ${action.id}`);
		}
		return {
			id: action.id,
			reportId: action.reportId,
			moderatorId,
			action: action.action,
			notes: action.notes
		};
	});
	await prisma.moderationAction.createMany({
		data: moderationActions,
		skipDuplicates: true
	});
}

main()
	.catch(async (error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

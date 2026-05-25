import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReportStatus, ReportTargetType } from '@spotwave/database';
import { DatabaseService } from '../../core/database/database.service';
import { CreateReportDto } from './dto/create-report.dto';
import { GetReportsQueryDto } from './dto/get-reports-query.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly db: DatabaseService) {}

  async create(reporterUserId: string, dto: CreateReportDto) {
    this.validateTarget(dto);

    const duplicate = await this.db.client.report.findFirst({
      where: {
        reporterUserId,
        targetType: dto.targetType,
        targetEventId: dto.targetEventId ?? null,
        targetUserId: dto.targetUserId ?? null,
        status: {
          in: [ReportStatus.OPEN, ReportStatus.REVIEWING],
        },
      },
      select: { id: true },
    });

    if (duplicate) {
      throw new ConflictException('Duplicate active report');
    }

    return this.db.client.report.create({
      data: {
        reporterUserId,
        targetType: dto.targetType,
        targetEventId: dto.targetEventId,
        targetUserId: dto.targetUserId,
        reason: dto.reason,
      },
    });
  }

  async findAll(query: GetReportsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = query.status ? { status: query.status } : {};
    const [items, total] = await this.db.client.$transaction([
      this.db.client.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.db.client.report.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async updateStatus(reportId: string, dto: UpdateReportStatusDto) {
    const exists = await this.db.client.report.findUnique({
      where: { id: reportId },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException(`Report with id "${reportId}" was not found`);
    }

    return this.db.client.report.update({
      where: { id: reportId },
      data: { status: dto.status },
    });
  }

  private validateTarget(dto: CreateReportDto) {
    if (dto.targetType === ReportTargetType.EVENT && !dto.targetEventId) {
      throw new BadRequestException('targetEventId is required for EVENT reports');
    }

    if (dto.targetType === ReportTargetType.USER && !dto.targetUserId) {
      throw new BadRequestException('targetUserId is required for USER reports');
    }

    if (dto.targetType === ReportTargetType.EVENT && dto.targetUserId) {
      throw new BadRequestException('targetUserId must not be set for EVENT reports');
    }

    if (dto.targetType === ReportTargetType.USER && dto.targetEventId) {
      throw new BadRequestException(
        'targetEventId must not be set for USER reports',
      );
    }
  }
}

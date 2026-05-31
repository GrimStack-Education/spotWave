import {
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
    await this.assertTargetExists(dto.targetType, dto.targetId);

    const duplicate = await this.db.client.report.findFirst({
      where: {
        reporterUserId,
        targetType: dto.targetType,
        targetEventId:
          dto.targetType === ReportTargetType.EVENT ? dto.targetId : undefined,
        targetUserId:
          dto.targetType === ReportTargetType.USER ? dto.targetId : undefined,
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
        targetEventId:
          dto.targetType === ReportTargetType.EVENT ? dto.targetId : null,
        targetUserId:
          dto.targetType === ReportTargetType.USER ? dto.targetId : null,
        reason: dto.reason.trim(),
        status: ReportStatus.OPEN,
      },
      include: {
        reporter: {
          select: { id: true, email: true },
        },
      },
    });
  }

  async findAll(query: GetReportsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.targetType ? { targetType: query.targetType } : {}),
    };
    const [items, total] = await this.db.client.$transaction([
      this.db.client.report.findMany({
        where,
        include: {
          reporter: {
            select: { id: true, email: true },
          },
          targetEvent: {
            select: { id: true, title: true, status: true },
          },
          targetUser: {
            select: { id: true, email: true, role: true },
          },
        },
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

  private async assertTargetExists(
    targetType: ReportTargetType,
    targetId: string,
  ) {
    if (targetType === ReportTargetType.EVENT) {
      const event = await this.db.client.event.findUnique({
        where: { id: targetId },
        select: { id: true },
      });

      if (!event) {
        throw new NotFoundException(
          `Event with id "${targetId}" was not found`,
        );
      }

      return;
    }

    if (targetType === ReportTargetType.USER) {
      const user = await this.db.client.user.findUnique({
        where: { id: targetId },
        select: { id: true },
      });

      if (!user) {
        throw new NotFoundException(`User with id "${targetId}" was not found`);
      }

      return;
    }

    throw new NotFoundException('Unsupported report target');
  }
}

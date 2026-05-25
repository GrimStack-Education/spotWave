import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReportStatus } from '@spotwave/database';
import { DatabaseService } from '../../core/database/database.service';
import { CreateReportDto } from './dto/create-report.dto';
import { GetReportsQueryDto } from './dto/get-reports-query.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly db: DatabaseService) {}

  async create(reporterUserId: string, dto: CreateReportDto) {
    const duplicate = await this.db.client.report.findFirst({
      where: {
        reporterId: reporterUserId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        status: {
          in: [ReportStatus.PENDING, ReportStatus.INVESTIGATING],
        },
      },
      select: { id: true },
    });

    if (duplicate) {
      throw new ConflictException('Duplicate active report');
    }

    return this.db.client.report.create({
      data: {
        reporterId: reporterUserId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        severity: dto.severity,
        status: ReportStatus.PENDING,
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
        orderBy: { id: 'desc' },
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

}

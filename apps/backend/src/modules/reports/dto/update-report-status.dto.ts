import { ReportStatus } from '@spotwave/database';
import { IsEnum } from 'class-validator';

export class UpdateReportStatusDto {
  @IsEnum(ReportStatus)
  status!: ReportStatus;
}

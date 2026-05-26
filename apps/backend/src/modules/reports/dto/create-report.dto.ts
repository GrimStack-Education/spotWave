import { ReportTargetType } from '@spotwave/database';
import { IsEnum, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateReportDto {
  @IsEnum(ReportTargetType)
  targetType!: ReportTargetType;

  @IsUUID()
  targetId!: string;

  @IsString()
  @MinLength(5)
  reason!: string;
}

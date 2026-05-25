import { ReportTargetType } from '@spotwave/database';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateReportDto {
  @IsEnum(ReportTargetType)
  targetType!: ReportTargetType;

  @IsOptional()
  @IsUUID()
  targetEventId?: string;

  @IsOptional()
  @IsUUID()
  targetUserId?: string;

  @IsString()
  @MinLength(5)
  reason!: string;
}

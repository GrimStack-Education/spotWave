import {
  IsEnum,
  IsIn,
  IsString,
  MinLength,
} from 'class-validator';
import { ReportSeverity } from '@spotwave/database';

export class CreateReportDto {
  @IsString()
  @IsIn(['EVENT', 'USER', 'COMMUNITY'])
  targetType!: string;

  @IsString()
  targetId!: string;

  @IsEnum(ReportSeverity)
  severity!: ReportSeverity;

  @IsString()
  @MinLength(5)
  action!: string;
}

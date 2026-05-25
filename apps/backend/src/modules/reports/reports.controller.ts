import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../../core/auth/current-user.decorator';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { Roles } from '../../core/auth/roles.decorator';
import { RolesGuard } from '../../core/auth/roles.guard';
import { CreateReportDto } from './dto/create-report.dto';
import { GetReportsQueryDto } from './dto/get-reports-query.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  create(@CurrentUser() user: { sub: string }, @Body() dto: CreateReportDto) {
    return this.reportsService.create(user.sub, dto);
  }

  @Get()
  @Roles('ADMIN')
  findAll(@Query() query: GetReportsQueryDto) {
    return this.reportsService.findAll(query);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateReportStatusDto) {
    return this.reportsService.updateStatus(id, dto);
  }
}

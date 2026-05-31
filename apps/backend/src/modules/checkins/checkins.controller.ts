import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../core/auth/current-user.decorator';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { CheckInsService } from './checkins.service';
import { CreateCheckInDto } from './dto/create-checkin.dto';

@Controller('events/:eventId/check-in')
@UseGuards(JwtAuthGuard)
export class CheckInsController {
  constructor(private readonly checkInsService: CheckInsService) {}

  @Post()
  create(
    @Param('eventId') eventId: string,
    @CurrentUser() user: { sub: string },
    @Body() dto: CreateCheckInDto,
  ) {
    return this.checkInsService.create(eventId, user.sub, dto);
  }
}

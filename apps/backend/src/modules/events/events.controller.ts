import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../../core/auth/current-user.decorator';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  create(@CurrentUser() user: { sub: string }, @Body() dto: CreateEventDto) {
    return this.eventsService.create(user.sub, dto);
  }

  @Patch(':id')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  update(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; role: string },
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, user.sub, user.role, dto);
  }

  @Delete(':id')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  remove(@Param('id') id: string, @CurrentUser() user: { sub: string; role: string }) {
    return this.eventsService.remove(id, user.sub, user.role);
  }
}

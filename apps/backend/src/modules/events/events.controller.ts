import {
  Body,
  Controller,
  Delete,
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
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { EventIdParamDto } from './dto/event-id-param.dto';
import { GetEventsQueryDto } from './dto/get-events-query.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll(@Query() query: GetEventsQueryDto) {
    return this.eventsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param() params: EventIdParamDto) {
    return this.eventsService.findOne(params.id);
  }

  @Get(':id/requests')
  @UseGuards(JwtAuthGuard)
  listJoinRequests(
    @Param() params: EventIdParamDto,
    @CurrentUser() user: { sub: string; role: string },
  ) {
    return this.eventsService.listJoinRequests(params.id, user.sub, user.role);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  create(@CurrentUser() user: { sub: string }, @Body() dto: CreateEventDto) {
    return this.eventsService.create(user.sub, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  update(
    @Param() params: EventIdParamDto,
    @CurrentUser() user: { sub: string; role: string },
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(params.id, user.sub, user.role, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  remove(
    @Param() params: EventIdParamDto,
    @CurrentUser() user: { sub: string; role: string },
  ) {
    return this.eventsService.remove(params.id, user.sub, user.role);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  join(@Param() params: EventIdParamDto, @CurrentUser() user: { sub: string }) {
    return this.eventsService.join(params.id, user.sub);
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  leave(
    @Param() params: EventIdParamDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.eventsService.leave(params.id, user.sub);
  }

  @Post(':id/requests/:userId/approve')
  @UseGuards(JwtAuthGuard)
  approveJoinRequest(
    @Param('id') eventId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: { sub: string; role: string },
  ) {
    return this.eventsService.approveJoinRequest(
      eventId,
      userId,
      user.sub,
      user.role,
    );
  }

  @Post(':id/requests/:userId/reject')
  @UseGuards(JwtAuthGuard)
  rejectJoinRequest(
    @Param('id') eventId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: { sub: string; role: string },
  ) {
    return this.eventsService.rejectJoinRequest(
      eventId,
      userId,
      user.sub,
      user.role,
    );
  }
}

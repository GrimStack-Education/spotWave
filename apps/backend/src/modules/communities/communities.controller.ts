import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../../core/auth/current-user.decorator';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { CommunitiesService } from './communities.service';
import { CommunityIdParamDto } from './dto/community-id-param.dto';
import { CreateCommunityDto } from './dto/create-community.dto';
import { CreateCommunityMessageDto } from './dto/create-community-message.dto';
import { GetCommunitiesQueryDto } from './dto/get-communities-query.dto';

@Controller('communities')
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  @Get()
  list(@Query() query: GetCommunitiesQueryDto) {
    return this.communitiesService.list(query);
  }

  @Get(':id')
  findOne(@Param() params: CommunityIdParamDto) {
    return this.communitiesService.findOne(params.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  create(
    @CurrentUser() user: { sub: string },
    @Body() dto: CreateCommunityDto,
  ) {
    return this.communitiesService.create(user.sub, dto);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  join(
    @Param() params: CommunityIdParamDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.communitiesService.join(params.id, user.sub);
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  leave(
    @Param() params: CommunityIdParamDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.communitiesService.leave(params.id, user.sub);
  }

  @Get(':id/messages')
  @UseGuards(JwtAuthGuard)
  listMessages(
    @Param() params: CommunityIdParamDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.communitiesService.listMessages(params.id, user.sub);
  }

  @Post(':id/messages')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  sendMessage(
    @Param() params: CommunityIdParamDto,
    @CurrentUser() user: { sub: string },
    @Body() dto: CreateCommunityMessageDto,
  ) {
    return this.communitiesService.sendMessage(params.id, user.sub, dto);
  }
}

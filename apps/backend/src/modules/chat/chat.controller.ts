import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../core/auth/current-user.decorator';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';

@Controller('events/:eventId/chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  list(
    @Param('eventId') eventId: string,
    @CurrentUser() user: { sub: string },
  ) {
    return this.chatService.list(eventId, user.sub);
  }

  @Post()
  send(
    @Param('eventId') eventId: string,
    @CurrentUser() user: { sub: string },
    @Body() dto: CreateChatMessageDto,
  ) {
    return this.chatService.send(eventId, user.sub, dto);
  }
}

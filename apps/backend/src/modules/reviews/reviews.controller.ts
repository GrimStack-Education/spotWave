import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../core/auth/current-user.decorator';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

@Controller('events/:eventId/reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  list(@Param('eventId') eventId: string) {
    return this.reviewsService.list(eventId);
  }

  @Post()
  create(
    @Param('eventId') eventId: string,
    @CurrentUser() user: { sub: string },
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(eventId, user.sub, dto);
  }
}

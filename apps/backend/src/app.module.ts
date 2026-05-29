import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateEnv } from './core/config/env.validation';
import { DatabaseModule } from './core/database/database.module';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import { TransformInterceptor } from './core/interceptors/transform.interceptor';
import { EventsModule } from './modules/events/events.module';
import { ParticipantsModule } from './modules/participants/participants.module';
import { AuthModule } from './modules/auth/auth.module';
import { ReportsModule } from './modules/reports/reports.module';
import { TagsModule } from './modules/tags/tags.module';
import { UsersModule } from './modules/users/users.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ChatModule } from './modules/chat/chat.module';
import { CheckInsModule } from './modules/checkins/checkins.module';
import { CommunitiesModule } from './modules/communities/communities.module';
import { MapTilesModule } from './modules/map-tiles/map-tiles.module';
  

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 120,
        },
      ],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    EventsModule,
    TagsModule,
    ParticipantsModule,
    ReportsModule,
    OnboardingModule,
    NotificationsModule,
    ReviewsModule,
    ChatModule,
    CheckInsModule,
    CommunitiesModule,
    MapTilesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateEnv } from './core/config/env.validation';
import { DatabaseModule } from './core/database/database.module';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import { TransformInterceptor } from './core/interceptors/transform.interceptor';
import { EventsModule } from './modules/events/events.module';
import { ParticipantsModule } from './modules/participants/participants.module';
import { ReportsModule } from './modules/reports/reports.module';
import { TagsModule } from './modules/tags/tags.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    DatabaseModule,
    UsersModule,
    EventsModule,
    TagsModule,
    ParticipantsModule,
    ReportsModule,
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
  ],
})
export class AppModule {}

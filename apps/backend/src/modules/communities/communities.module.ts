import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CommunitiesController } from './communities.controller';
import { CommunitiesGateway } from './communities.gateway';
import { CommunitiesService } from './communities.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [CommunitiesController],
  providers: [CommunitiesService, CommunitiesGateway],
})
export class CommunitiesModule {}

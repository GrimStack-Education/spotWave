import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { prisma } from '@spotwave/database';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  public readonly client = prisma;

  async onModuleInit() {
    await this.client.$connect();
    this.logger.log('Database connection established');
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
    this.logger.log('Database connection closed');
  }
}

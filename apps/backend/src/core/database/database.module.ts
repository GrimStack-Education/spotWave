import { Injectable, Global, Module } from '@nestjs/common';
import { prisma } from '@spotwave/database';

@Injectable()
export class DatabaseService {
  public readonly client = prisma;
}

@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}

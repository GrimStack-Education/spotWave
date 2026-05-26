import { Injectable } from '@nestjs/common';
import { DatabaseService } from './core/database/database.service';

@Injectable()
export class AppService {
  constructor(private readonly db: DatabaseService) {}

  getHello(): string {
    return 'Hello World!';
  }

  getHealth() {
    return { ok: true };
  }

  async getReadiness() {
    await this.db.client.$queryRaw`SELECT 1`;
    return { ok: true };
  }
}

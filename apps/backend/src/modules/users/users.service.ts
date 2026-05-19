import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/core/database/database.module';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.client.user.findMany();
  }

  async findOne(id: string) {
    return this.db.client.user.findUnique({ where: { id } });
  }
}

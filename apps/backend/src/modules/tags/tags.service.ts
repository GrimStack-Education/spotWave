import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';

@Injectable()
export class TagsService {
  constructor(private readonly db: DatabaseService) {}

  findAll() {
    return this.db.client.tag.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.db.client.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return users.map((user) => this.toResponseDto(user));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.db.client.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" was not found`);
    }

    return this.toResponseDto(user);
  }

  private toResponseDto(user: {
    id: string;
    email: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  }): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

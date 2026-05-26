import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { compare, hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@spotwave/database';
import { DatabaseService } from '../../core/database/database.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.db.client.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    const passwordHash = await hash(dto.password, 10);
    const displayName = dto.name?.trim() || dto.email.split('@')[0];

    const user = await this.db.client.user.create({
      data: {
        firebaseUid: `local-${randomUUID()}`,
        email: dto.email,
        password: passwordHash,
        displayName,
        role: UserRole.USER,
        profile: {
          create: {
            displayName,
          },
        },
      },
      select: { id: true, email: true, role: true },
    });

    return {
      accessToken: await this.signAccessToken(user.id, user.email, user.role),
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.db.client.user.findUnique({
      where: { email: dto.email },
      select: { id: true, email: true, password: true, role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException('Password login is not available for this user');
    }

    const isPasswordValid = await compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      accessToken: await this.signAccessToken(user.id, user.email, user.role),
    };
  }

  async getMe(userId: string) {
    return this.db.client.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        profile: {
          select: {
            displayName: true,
            avatarUrl: true,
            bio: true,
            homeLat: true,
            homeLng: true,
            radiusKm: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async refresh(userId: string): Promise<AuthResponseDto> {
    const user = await this.db.client.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    return {
      accessToken: await this.signAccessToken(user.id, user.email, user.role),
    };
  }

  private signAccessToken(userId: string, email: string, role: string) {
    return this.jwtService.signAsync({
      sub: userId,
      email,
      role,
    });
  }
}

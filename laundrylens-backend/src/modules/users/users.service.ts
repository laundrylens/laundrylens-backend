import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { CreateUserDto, UpdateUserDto } from './dto';
import { SocialProvider, User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<User> {
    return this.prisma.user.create({
      data: dto,
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id, deletedAt: null },
    });
  }

  async findByIdOrThrow(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email, deletedAt: null },
    });
  }

  async findBySocialAccount(
    provider: SocialProvider,
    providerId: string,
  ): Promise<User | null> {
    const socialAccount = await this.prisma.socialAccount.findUnique({
      where: {
        provider_providerId: { provider, providerId },
      },
      include: { user: true },
    });

    if (!socialAccount || socialAccount.user.deletedAt) {
      return null;
    }

    return socialAccount.user;
  }

  async createWithSocialAccount(
    dto: CreateUserDto,
    provider: SocialProvider,
    providerId: string,
    tokens?: { accessToken?: string; refreshToken?: string },
  ): Promise<User> {
    return this.prisma.user.create({
      data: {
        ...dto,
        socialAccounts: {
          create: {
            provider,
            providerId,
            accessToken: tokens?.accessToken,
            refreshToken: tokens?.refreshToken,
          },
        },
      },
      include: { socialAccounts: true },
    });
  }

  async linkSocialAccount(
    userId: string,
    provider: SocialProvider,
    providerId: string,
    tokens?: { accessToken?: string; refreshToken?: string },
  ): Promise<void> {
    await this.prisma.socialAccount.create({
      data: {
        userId,
        provider,
        providerId,
        accessToken: tokens?.accessToken,
        refreshToken: tokens?.refreshToken,
      },
    });
  }

  async updateSocialAccountTokens(
    provider: SocialProvider,
    providerId: string,
    tokens: { accessToken?: string; refreshToken?: string },
  ): Promise<void> {
    await this.prisma.socialAccount.update({
      where: {
        provider_providerId: { provider, providerId },
      },
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.findByIdOrThrow(id);
    return this.prisma.user.update({
      where: { id },
      data: dto,
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.findByIdOrThrow(id);
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async unlinkSocialAccount(
    userId: string,
    provider: SocialProvider,
  ): Promise<void> {
    await this.prisma.socialAccount.deleteMany({
      where: { userId, provider },
    });
  }
}

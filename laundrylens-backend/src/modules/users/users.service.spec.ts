import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma';
import { SocialProvider } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = {
    id: 'user-id-1',
    email: 'test@example.com',
    nickname: '테스트유저',
    profileImage: null,
    isPremium: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    socialAccount: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create({
        email: 'test@example.com',
        nickname: '테스트유저',
      });

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: { email: 'test@example.com', nickname: '테스트유저' },
      });
    });
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById('user-id-1');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id-1', deletedAt: null },
      });
    });

    it('should return null when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByIdOrThrow', () => {
    it('should return a user when found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByIdOrThrow('user-id-1');

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findByIdOrThrow('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user when found by email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com', deletedAt: null },
      });
    });
  });

  describe('findBySocialAccount', () => {
    it('should return a user when found by social account', async () => {
      mockPrismaService.socialAccount.findUnique.mockResolvedValue({
        id: 'social-id-1',
        user: mockUser,
      });

      const result = await service.findBySocialAccount(
        SocialProvider.KAKAO,
        'kakao-123',
      );

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.socialAccount.findUnique).toHaveBeenCalledWith({
        where: {
          provider_providerId: {
            provider: SocialProvider.KAKAO,
            providerId: 'kakao-123',
          },
        },
        include: { user: true },
      });
    });

    it('should return null when social account not found', async () => {
      mockPrismaService.socialAccount.findUnique.mockResolvedValue(null);

      const result = await service.findBySocialAccount(
        SocialProvider.KAKAO,
        'non-existent',
      );

      expect(result).toBeNull();
    });

    it('should return null when user is soft deleted', async () => {
      mockPrismaService.socialAccount.findUnique.mockResolvedValue({
        id: 'social-id-1',
        user: { ...mockUser, deletedAt: new Date() },
      });

      const result = await service.findBySocialAccount(
        SocialProvider.KAKAO,
        'kakao-123',
      );

      expect(result).toBeNull();
    });
  });

  describe('createWithSocialAccount', () => {
    it('should create a user with social account', async () => {
      const userWithSocial = {
        ...mockUser,
        socialAccounts: [
          {
            id: 'social-id-1',
            provider: SocialProvider.KAKAO,
            providerId: 'kakao-123',
          },
        ],
      };
      mockPrismaService.user.create.mockResolvedValue(userWithSocial);

      const result = await service.createWithSocialAccount(
        { nickname: '테스트유저', email: 'test@example.com' },
        SocialProvider.KAKAO,
        'kakao-123',
        { accessToken: 'access-token' },
      );

      expect(result).toEqual(userWithSocial);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          nickname: '테스트유저',
          email: 'test@example.com',
          socialAccounts: {
            create: {
              provider: SocialProvider.KAKAO,
              providerId: 'kakao-123',
              accessToken: 'access-token',
              refreshToken: undefined,
            },
          },
        },
        include: { socialAccounts: true },
      });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updatedUser = { ...mockUser, nickname: '새닉네임' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('user-id-1', {
        nickname: '새닉네임',
      });

      expect(result).toEqual(updatedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
        data: { nickname: '새닉네임' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { nickname: '새닉네임' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDelete', () => {
    it('should soft delete a user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        deletedAt: new Date(),
      });

      await service.softDelete('user-id-1');

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
        data: { deletedAt: expect.any(Date) as Date },
      });
    });
  });

  describe('linkSocialAccount', () => {
    it('should link a social account to user', async () => {
      mockPrismaService.socialAccount.create.mockResolvedValue({});

      await service.linkSocialAccount(
        'user-id-1',
        SocialProvider.GOOGLE,
        'google-123',
        { accessToken: 'token' },
      );

      expect(mockPrismaService.socialAccount.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-id-1',
          provider: SocialProvider.GOOGLE,
          providerId: 'google-123',
          accessToken: 'token',
          refreshToken: undefined,
        },
      });
    });
  });

  describe('unlinkSocialAccount', () => {
    it('should unlink a social account from user', async () => {
      mockPrismaService.socialAccount.deleteMany.mockResolvedValue({
        count: 1,
      });

      await service.unlinkSocialAccount('user-id-1', SocialProvider.KAKAO);

      expect(mockPrismaService.socialAccount.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-id-1', provider: SocialProvider.KAKAO },
      });
    });
  });
});

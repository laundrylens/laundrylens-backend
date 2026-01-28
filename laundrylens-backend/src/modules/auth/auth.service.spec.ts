import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersService } from '../users';
import { SocialProvider } from '@prisma/client';
import { OAuthUser } from './interfaces';

describe('AuthService', () => {
  let service: AuthService;

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

  const mockUsersService = {
    findBySocialAccount: jest.fn(),
    findByEmail: jest.fn(),
    updateSocialAccountTokens: jest.fn(),
    linkSocialAccount: jest.fn(),
    createWithSocialAccount: jest.fn(),
    findById: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        'jwt.secret': 'test-secret',
        'jwt.expiresIn': '7d',
        'jwt.refreshExpiresIn': '30d',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateOAuthUser', () => {
    const oauthUser: OAuthUser = {
      provider: SocialProvider.KAKAO,
      providerId: 'kakao-123',
      email: 'test@example.com',
      nickname: '테스트유저',
      profileImage: undefined,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };

    it('should return existing user and update tokens', async () => {
      mockUsersService.findBySocialAccount.mockResolvedValue(mockUser);

      const result = await service.validateOAuthUser(oauthUser);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.updateSocialAccountTokens).toHaveBeenCalledWith(
        SocialProvider.KAKAO,
        'kakao-123',
        { accessToken: 'access-token', refreshToken: 'refresh-token' },
      );
    });

    it('should link social account to existing user with same email', async () => {
      mockUsersService.findBySocialAccount.mockResolvedValue(null);
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      const result = await service.validateOAuthUser(oauthUser);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.linkSocialAccount).toHaveBeenCalledWith(
        mockUser.id,
        SocialProvider.KAKAO,
        'kakao-123',
        { accessToken: 'access-token', refreshToken: 'refresh-token' },
      );
    });

    it('should create new user if not found', async () => {
      mockUsersService.findBySocialAccount.mockResolvedValue(null);
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.createWithSocialAccount.mockResolvedValue(mockUser);

      const result = await service.validateOAuthUser(oauthUser);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.createWithSocialAccount).toHaveBeenCalledWith(
        {
          email: 'test@example.com',
          nickname: '테스트유저',
          profileImage: undefined,
        },
        SocialProvider.KAKAO,
        'kakao-123',
        { accessToken: 'access-token', refreshToken: 'refresh-token' },
      );
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const result = service.generateTokens(mockUser);

      expect(result).toEqual({
        accessToken: 'mock-token',
        refreshToken: 'mock-token',
      });
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
    });
  });

  describe('createTokenResponse', () => {
    it('should create token response with user info', () => {
      const result = service.createTokenResponse(mockUser);

      expect(result).toEqual({
        accessToken: 'mock-token',
        refreshToken: 'mock-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          nickname: mockUser.nickname,
          profileImage: mockUser.profileImage,
          isPremium: mockUser.isPremium,
        },
      });
    });
  });

  describe('validateToken', () => {
    it('should return payload on valid token', () => {
      const payload = { sub: 'user-id-1', email: 'test@example.com' };
      mockJwtService.verify.mockReturnValue(payload);

      const result = service.validateToken('valid-token');

      expect(result).toEqual(payload);
    });

    it('should return null on invalid token', () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = service.validateToken('invalid-token');

      expect(result).toBeNull();
    });
  });

  describe('refreshTokens', () => {
    it('should return new tokens on valid refresh token', async () => {
      const payload = { sub: 'user-id-1', email: 'test@example.com' };
      mockJwtService.verify.mockReturnValue(payload);
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await service.refreshTokens('valid-refresh-token');

      expect(result).toBeDefined();
      expect(result?.accessToken).toBe('mock-token');
    });

    it('should return null on invalid refresh token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await service.refreshTokens('invalid-token');

      expect(result).toBeNull();
    });

    it('should return null if user not found', async () => {
      const payload = { sub: 'user-id-1', email: 'test@example.com' };
      mockJwtService.verify.mockReturnValue(payload);
      mockUsersService.findById.mockResolvedValue(null);

      const result = await service.refreshTokens('valid-token');

      expect(result).toBeNull();
    });
  });

  describe('deleteAccount', () => {
    it('should soft delete user and call unlink callback', async () => {
      const unlinkCallback = jest.fn().mockResolvedValue(undefined);

      await service.deleteAccount(
        'user-id-1',
        SocialProvider.KAKAO,
        unlinkCallback,
      );

      expect(unlinkCallback).toHaveBeenCalled();
      expect(mockUsersService.softDelete).toHaveBeenCalledWith('user-id-1');
    });

    it('should soft delete user without callback', async () => {
      await service.deleteAccount('user-id-1', SocialProvider.KAKAO);

      expect(mockUsersService.softDelete).toHaveBeenCalledWith('user-id-1');
    });
  });
});

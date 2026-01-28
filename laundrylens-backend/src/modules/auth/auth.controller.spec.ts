import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { KakaoService } from './services/kakao.service';
import { GoogleService } from './services/google.service';

describe('AuthController', () => {
  let controller: AuthController;

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

  const mockTokenResponse = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresIn: 3600,
  };

  const mockOAuthUser = {
    provider: 'kakao' as const,
    providerId: 'kakao-123',
    email: 'test@example.com',
    nickname: '테스트유저',
    profileImage: null,
  };

  const mockAuthService = {
    validateOAuthUser: jest.fn(),
    createTokenResponse: jest.fn(),
    validateToken: jest.fn(),
    refreshTokens: jest.fn(),
    deleteAccount: jest.fn(),
  };

  const mockKakaoService = {
    getAuthorizationUrl: jest.fn(),
    authenticate: jest.fn(),
  };

  const mockGoogleService = {
    getAuthorizationUrl: jest.fn(),
    authenticate: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        'frontend.url': 'http://localhost:3000',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: KakaoService, useValue: mockKakaoService },
        { provide: GoogleService, useValue: mockGoogleService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('kakaoLogin', () => {
    it('should redirect to kakao auth url', () => {
      const mockRes = { redirect: jest.fn() };
      mockKakaoService.getAuthorizationUrl.mockReturnValue(
        'https://kakao.auth.url',
      );

      controller.kakaoLogin(mockRes as any);

      expect(mockKakaoService.getAuthorizationUrl).toHaveBeenCalled();
      expect(mockRes.redirect).toHaveBeenCalledWith('https://kakao.auth.url');
    });
  });

  describe('kakaoCallback', () => {
    it('should authenticate and redirect with tokens', async () => {
      const mockRes = { redirect: jest.fn() };
      mockKakaoService.authenticate.mockResolvedValue(mockOAuthUser);
      mockAuthService.validateOAuthUser.mockResolvedValue(mockUser);
      mockAuthService.createTokenResponse.mockReturnValue(mockTokenResponse);

      await controller.kakaoCallback({ code: 'auth-code' }, mockRes as any);

      expect(mockKakaoService.authenticate).toHaveBeenCalledWith('auth-code');
      expect(mockAuthService.validateOAuthUser).toHaveBeenCalledWith(
        mockOAuthUser,
      );
      expect(mockRes.redirect).toHaveBeenCalledWith(
        expect.stringContaining('accessToken=access-token'),
      );
    });
  });

  describe('kakaoToken', () => {
    it('should return tokens for valid auth code', async () => {
      mockKakaoService.authenticate.mockResolvedValue(mockOAuthUser);
      mockAuthService.validateOAuthUser.mockResolvedValue(mockUser);
      mockAuthService.createTokenResponse.mockReturnValue(mockTokenResponse);

      const result = await controller.kakaoToken({ code: 'auth-code' });

      expect(result).toEqual(mockTokenResponse);
    });
  });

  describe('googleLogin', () => {
    it('should redirect to google auth url', () => {
      const mockRes = { redirect: jest.fn() };
      mockGoogleService.getAuthorizationUrl.mockReturnValue(
        'https://google.auth.url',
      );

      controller.googleLogin(mockRes as any);

      expect(mockGoogleService.getAuthorizationUrl).toHaveBeenCalled();
      expect(mockRes.redirect).toHaveBeenCalledWith('https://google.auth.url');
    });
  });

  describe('googleCallback', () => {
    it('should authenticate and redirect with tokens', async () => {
      const mockRes = { redirect: jest.fn() };
      const googleOAuthUser = { ...mockOAuthUser, provider: 'google' as const };
      mockGoogleService.authenticate.mockResolvedValue(googleOAuthUser);
      mockAuthService.validateOAuthUser.mockResolvedValue(mockUser);
      mockAuthService.createTokenResponse.mockReturnValue(mockTokenResponse);

      await controller.googleCallback({ code: 'auth-code' }, mockRes as any);

      expect(mockGoogleService.authenticate).toHaveBeenCalledWith('auth-code');
      expect(mockAuthService.validateOAuthUser).toHaveBeenCalledWith(
        googleOAuthUser,
      );
      expect(mockRes.redirect).toHaveBeenCalledWith(
        expect.stringContaining('accessToken=access-token'),
      );
    });
  });

  describe('googleToken', () => {
    it('should return tokens for valid auth code', async () => {
      const googleOAuthUser = { ...mockOAuthUser, provider: 'google' as const };
      mockGoogleService.authenticate.mockResolvedValue(googleOAuthUser);
      mockAuthService.validateOAuthUser.mockResolvedValue(mockUser);
      mockAuthService.createTokenResponse.mockReturnValue(mockTokenResponse);

      const result = await controller.googleToken({ code: 'auth-code' });

      expect(result).toEqual(mockTokenResponse);
    });
  });

  describe('refresh', () => {
    it('should return new tokens for valid refresh token', async () => {
      mockAuthService.refreshTokens.mockResolvedValue(mockTokenResponse);

      const result = await controller.refresh({
        refreshToken: 'valid-refresh-token',
      });

      expect(result).toEqual(mockTokenResponse);
      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(
        'valid-refresh-token',
      );
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockAuthService.refreshTokens.mockResolvedValue(null);

      await expect(
        controller.refresh({ refreshToken: 'invalid-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should return success message', () => {
      const result = controller.logout();

      expect(result).toEqual({ message: '로그아웃되었습니다.' });
    });
  });

  describe('deleteAccount', () => {
    it('should delete account and return success message', async () => {
      mockAuthService.deleteAccount.mockResolvedValue(undefined);

      const result = await controller.deleteAccount(mockUser as any);

      expect(result).toEqual({ message: '회원 탈퇴가 완료되었습니다.' });
      expect(mockAuthService.deleteAccount).toHaveBeenCalledWith('user-id-1');
    });
  });

  describe('getProfile', () => {
    it('should return current user', () => {
      const result = controller.getProfile(mockUser as any);

      expect(result).toEqual(mockUser);
    });
  });
});

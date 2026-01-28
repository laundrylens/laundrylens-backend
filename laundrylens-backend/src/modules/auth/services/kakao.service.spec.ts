import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { KakaoService } from './kakao.service';
import { SocialProvider } from '@prisma/client';

describe('KakaoService', () => {
  let service: KakaoService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        'oauth.kakao.clientId': 'test-client-id',
        'oauth.kakao.clientSecret': 'test-client-secret',
        'oauth.kakao.callbackUrl':
          'http://localhost:3000/api/auth/kakao/callback',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KakaoService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<KakaoService>(KakaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAuthorizationUrl', () => {
    it('should return kakao authorization URL', () => {
      const url = service.getAuthorizationUrl();

      expect(url).toContain('https://kauth.kakao.com/oauth/authorize');
      expect(url).toContain('client_id=test-client-id');
      expect(url).toContain('redirect_uri=');
      expect(url).toContain('response_type=code');
    });
  });

  describe('getAccessToken', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('should return token response on success', async () => {
      const mockTokenResponse = {
        access_token: 'kakao-access-token',
        token_type: 'bearer',
        refresh_token: 'kakao-refresh-token',
        expires_in: 21599,
        scope: 'profile_nickname profile_image account_email',
        refresh_token_expires_in: 5183999,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse),
      });

      const result = await service.getAccessToken('test-code');

      expect(result).toEqual(mockTokenResponse);
    });

    it('should throw UnauthorizedException on failure', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
      });

      await expect(service.getAccessToken('invalid-code')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getUserInfo', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('should return user info on success', async () => {
      const mockUserResponse = {
        id: 12345,
        kakao_account: {
          email: 'test@kakao.com',
          profile: {
            nickname: '테스트유저',
            profile_image_url: 'https://example.com/profile.jpg',
          },
        },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUserResponse),
      });

      const result = await service.getUserInfo('test-access-token');

      expect(result).toEqual(mockUserResponse);
    });

    it('should throw UnauthorizedException on failure', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
      });

      await expect(service.getUserInfo('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('authenticate', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('should return OAuthUser on successful authentication', async () => {
      const mockTokenResponse = {
        access_token: 'kakao-access-token',
        token_type: 'bearer',
        refresh_token: 'kakao-refresh-token',
        expires_in: 21599,
        scope: 'profile',
        refresh_token_expires_in: 5183999,
      };

      const mockUserResponse = {
        id: 12345,
        kakao_account: {
          email: 'test@kakao.com',
          profile: {
            nickname: '테스트유저',
            profile_image_url: 'https://example.com/profile.jpg',
          },
        },
      };

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTokenResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUserResponse),
        });

      const result = await service.authenticate('test-code');

      expect(result).toEqual({
        provider: SocialProvider.KAKAO,
        providerId: '12345',
        email: 'test@kakao.com',
        nickname: '테스트유저',
        profileImage: 'https://example.com/profile.jpg',
        accessToken: 'kakao-access-token',
        refreshToken: 'kakao-refresh-token',
      });
    });
  });
});

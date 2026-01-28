import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { GoogleService } from './google.service';
import { SocialProvider } from '@prisma/client';

describe('GoogleService', () => {
  let service: GoogleService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        'oauth.google.clientId': 'test-client-id',
        'oauth.google.clientSecret': 'test-client-secret',
        'oauth.google.callbackUrl':
          'http://localhost:3000/api/auth/google/callback',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<GoogleService>(GoogleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAuthorizationUrl', () => {
    it('should return google authorization URL', () => {
      const url = service.getAuthorizationUrl();

      expect(url).toContain('https://accounts.google.com/o/oauth2/v2/auth');
      expect(url).toContain('client_id=test-client-id');
      expect(url).toContain('redirect_uri=');
      expect(url).toContain('response_type=code');
      expect(url).toContain('scope=email+profile');
    });
  });

  describe('getAccessToken', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('should return token response on success', async () => {
      const mockTokenResponse = {
        access_token: 'google-access-token',
        expires_in: 3599,
        token_type: 'Bearer',
        scope: 'email profile',
        refresh_token: 'google-refresh-token',
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
        id: '12345',
        email: 'test@gmail.com',
        verified_email: true,
        name: '테스트유저',
        picture: 'https://example.com/profile.jpg',
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
        access_token: 'google-access-token',
        expires_in: 3599,
        token_type: 'Bearer',
        scope: 'email profile',
        refresh_token: 'google-refresh-token',
      };

      const mockUserResponse = {
        id: '12345',
        email: 'test@gmail.com',
        verified_email: true,
        name: '테스트유저',
        picture: 'https://example.com/profile.jpg',
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
        provider: SocialProvider.GOOGLE,
        providerId: '12345',
        email: 'test@gmail.com',
        nickname: '테스트유저',
        profileImage: 'https://example.com/profile.jpg',
        accessToken: 'google-access-token',
        refreshToken: 'google-refresh-token',
      });
    });
  });
});

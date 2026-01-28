import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SocialProvider } from '@prisma/client';
import { OAuthUser } from '../interfaces';

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token?: string;
  id_token?: string;
}

interface GoogleUserResponse {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

@Injectable()
export class GoogleService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor(private readonly configService: ConfigService) {
    this.clientId =
      this.configService.get<string>('oauth.google.clientId') || '';
    this.clientSecret =
      this.configService.get<string>('oauth.google.clientSecret') || '';
    this.redirectUri =
      this.configService.get<string>('oauth.google.callbackUrl') || '';
  }

  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'email profile',
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async getAccessToken(code: string): Promise<GoogleTokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      code,
    });

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new UnauthorizedException('구글 토큰 발급에 실패했습니다.');
    }

    return response.json() as Promise<GoogleTokenResponse>;
  }

  async getUserInfo(accessToken: string): Promise<GoogleUserResponse> {
    const response = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new UnauthorizedException('구글 사용자 정보 조회에 실패했습니다.');
    }

    return response.json() as Promise<GoogleUserResponse>;
  }

  async authenticate(code: string): Promise<OAuthUser> {
    const tokenResponse = await this.getAccessToken(code);
    const userInfo = await this.getUserInfo(tokenResponse.access_token);

    return {
      provider: SocialProvider.GOOGLE,
      providerId: userInfo.id,
      email: userInfo.email,
      nickname: userInfo.name || `구글유저${userInfo.id}`,
      profileImage: userInfo.picture,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
    };
  }

  async revokeToken(accessToken: string): Promise<void> {
    const response = await fetch(
      `https://oauth2.googleapis.com/revoke?token=${accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    if (!response.ok) {
      throw new UnauthorizedException('구글 연결 해제에 실패했습니다.');
    }
  }
}

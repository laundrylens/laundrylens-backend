import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SocialProvider } from '@prisma/client';
import { OAuthUser } from '../interfaces';

interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  refresh_token_expires_in: number;
}

interface KakaoUserResponse {
  id: number;
  kakao_account?: {
    email?: string;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
    };
  };
}

@Injectable()
export class KakaoService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor(private readonly configService: ConfigService) {
    this.clientId =
      this.configService.get<string>('oauth.kakao.clientId') || '';
    this.clientSecret =
      this.configService.get<string>('oauth.kakao.clientSecret') || '';
    this.redirectUri =
      this.configService.get<string>('oauth.kakao.callbackUrl') || '';
  }

  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'profile_nickname profile_image account_email',
    });

    return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
  }

  async getAccessToken(code: string): Promise<KakaoTokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      code,
    });

    const response = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new UnauthorizedException('카카오 토큰 발급에 실패했습니다.');
    }

    return response.json() as Promise<KakaoTokenResponse>;
  }

  async getUserInfo(accessToken: string): Promise<KakaoUserResponse> {
    const response = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new UnauthorizedException(
        '카카오 사용자 정보 조회에 실패했습니다.',
      );
    }

    return response.json() as Promise<KakaoUserResponse>;
  }

  async authenticate(code: string): Promise<OAuthUser> {
    const tokenResponse = await this.getAccessToken(code);
    const userInfo = await this.getUserInfo(tokenResponse.access_token);

    return {
      provider: SocialProvider.KAKAO,
      providerId: String(userInfo.id),
      email: userInfo.kakao_account?.email,
      nickname:
        userInfo.kakao_account?.profile?.nickname || `카카오유저${userInfo.id}`,
      profileImage: userInfo.kakao_account?.profile?.profile_image_url,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
    };
  }

  async unlinkUser(accessToken: string): Promise<void> {
    const response = await fetch('https://kapi.kakao.com/v1/user/unlink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new UnauthorizedException('카카오 연결 해제에 실패했습니다.');
    }
  }
}

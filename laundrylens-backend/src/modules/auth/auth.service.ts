import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SocialProvider, User } from '@prisma/client';
import { UsersService } from '../users';
import { OAuthUser } from './interfaces';
import { TokenResponseDto } from './dto';

interface JwtPayloadData {
  sub: string;
  email: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateOAuthUser(oauthUser: OAuthUser): Promise<User> {
    // 기존 소셜 계정으로 사용자 찾기
    let user = await this.usersService.findBySocialAccount(
      oauthUser.provider,
      oauthUser.providerId,
    );

    if (user) {
      // 토큰 업데이트
      await this.usersService.updateSocialAccountTokens(
        oauthUser.provider,
        oauthUser.providerId,
        {
          accessToken: oauthUser.accessToken,
          refreshToken: oauthUser.refreshToken,
        },
      );
      return user;
    }

    // 이메일로 기존 사용자 찾기 (다른 소셜 계정으로 가입한 경우)
    if (oauthUser.email) {
      user = await this.usersService.findByEmail(oauthUser.email);
      if (user) {
        // 기존 사용자에 소셜 계정 연결
        await this.usersService.linkSocialAccount(
          user.id,
          oauthUser.provider,
          oauthUser.providerId,
          {
            accessToken: oauthUser.accessToken,
            refreshToken: oauthUser.refreshToken,
          },
        );
        return user;
      }
    }

    // 신규 사용자 생성
    return this.usersService.createWithSocialAccount(
      {
        email: oauthUser.email,
        nickname: oauthUser.nickname,
        profileImage: oauthUser.profileImage,
      },
      oauthUser.provider,
      oauthUser.providerId,
      {
        accessToken: oauthUser.accessToken,
        refreshToken: oauthUser.refreshToken,
      },
    );
  }

  generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const secret = this.configService.get<string>('jwt.secret');
    const accessExpiresIn =
      this.configService.get<string>('jwt.expiresIn') || '7d';
    const refreshExpiresIn =
      this.configService.get<string>('jwt.refreshExpiresIn') || '30d';

    const accessToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: accessExpiresIn,
    } as Parameters<JwtService['sign']>[1]);

    const refreshToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: refreshExpiresIn,
    } as Parameters<JwtService['sign']>[1]);

    return { accessToken, refreshToken };
  }

  createTokenResponse(user: User): TokenResponseDto {
    const { accessToken, refreshToken } = this.generateTokens(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        profileImage: user.profileImage,
        isPremium: user.isPremium,
      },
    };
  }

  validateToken(token: string): JwtPayloadData | null {
    try {
      return this.jwtService.verify<JwtPayloadData>(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });
    } catch {
      return null;
    }
  }

  async refreshTokens(refreshToken: string): Promise<TokenResponseDto | null> {
    const payload = this.validateToken(refreshToken);
    if (!payload) {
      return null;
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      return null;
    }

    return this.createTokenResponse(user);
  }

  async getUserFromToken(token: string): Promise<User | null> {
    const payload = this.validateToken(token);
    if (!payload) {
      return null;
    }

    return this.usersService.findById(payload.sub);
  }

  async deleteAccount(
    userId: string,
    provider: SocialProvider,
    unlinkCallback?: () => Promise<void>,
  ): Promise<void> {
    // 소셜 계정 연결 해제 콜백 실행
    if (unlinkCallback) {
      await unlinkCallback();
    }

    // 사용자 소프트 삭제
    await this.usersService.softDelete(userId);
  }
}

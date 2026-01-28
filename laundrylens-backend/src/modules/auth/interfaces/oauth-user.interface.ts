import { SocialProvider } from '@prisma/client';

export interface OAuthUser {
  provider: SocialProvider;
  providerId: string;
  email?: string;
  nickname: string;
  profileImage?: string;
  accessToken: string;
  refreshToken?: string;
}

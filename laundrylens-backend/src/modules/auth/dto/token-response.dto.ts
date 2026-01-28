import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({ description: 'JWT Access Token' })
  accessToken: string;

  @ApiProperty({ description: 'JWT Refresh Token' })
  refreshToken: string;

  @ApiProperty({ description: '사용자 정보' })
  user: {
    id: string;
    email: string | null;
    nickname: string;
    profileImage: string | null;
    isPremium: boolean;
  };
}

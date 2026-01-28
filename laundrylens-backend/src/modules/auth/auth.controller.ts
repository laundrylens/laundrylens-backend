import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { KakaoService } from './services';
import { OAuthCallbackDto, TokenResponseDto } from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly kakaoService: KakaoService,
    private readonly configService: ConfigService,
  ) {}

  @Get('kakao')
  @ApiOperation({ summary: '카카오 로그인 페이지로 리다이렉트' })
  @ApiResponse({
    status: 302,
    description: '카카오 로그인 페이지로 리다이렉트',
  })
  kakaoLogin(@Res() res: Response): void {
    const authUrl = this.kakaoService.getAuthorizationUrl();
    res.redirect(authUrl);
  }

  @Get('kakao/callback')
  @ApiOperation({ summary: '카카오 OAuth 콜백 처리' })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    type: TokenResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async kakaoCallback(
    @Query() dto: OAuthCallbackDto,
    @Res() res: Response,
  ): Promise<void> {
    const oauthUser = await this.kakaoService.authenticate(dto.code);
    const user = await this.authService.validateOAuthUser(oauthUser);
    const tokenResponse = this.authService.createTokenResponse(user);

    // 프론트엔드로 리다이렉트 (토큰을 쿼리 파라미터로 전달)
    const frontendUrl = this.configService.get<string>('frontend.url');
    const redirectUrl = `${frontendUrl}/auth/callback?accessToken=${tokenResponse.accessToken}&refreshToken=${tokenResponse.refreshToken}`;
    res.redirect(redirectUrl);
  }

  @Post('kakao/token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '카카오 인가코드로 토큰 발급' })
  @ApiResponse({
    status: 200,
    description: '토큰 발급 성공',
    type: TokenResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async kakaoToken(@Body() dto: OAuthCallbackDto): Promise<TokenResponseDto> {
    const oauthUser = await this.kakaoService.authenticate(dto.code);
    const user = await this.authService.validateOAuthUser(oauthUser);
    return this.authService.createTokenResponse(user);
  }
}

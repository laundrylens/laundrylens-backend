import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Res,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { KakaoService, GoogleService } from './services';
import { OAuthCallbackDto, TokenResponseDto, RefreshTokenDto } from './dto';
import { JwtAuthGuard } from './guards';
import { CurrentUser, Public } from './decorators';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly kakaoService: KakaoService,
    private readonly googleService: GoogleService,
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

  @Get('google')
  @ApiOperation({ summary: '구글 로그인 페이지로 리다이렉트' })
  @ApiResponse({
    status: 302,
    description: '구글 로그인 페이지로 리다이렉트',
  })
  googleLogin(@Res() res: Response): void {
    const authUrl = this.googleService.getAuthorizationUrl();
    res.redirect(authUrl);
  }

  @Get('google/callback')
  @ApiOperation({ summary: '구글 OAuth 콜백 처리' })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    type: TokenResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async googleCallback(
    @Query() dto: OAuthCallbackDto,
    @Res() res: Response,
  ): Promise<void> {
    const oauthUser = await this.googleService.authenticate(dto.code);
    const user = await this.authService.validateOAuthUser(oauthUser);
    const tokenResponse = this.authService.createTokenResponse(user);

    const frontendUrl = this.configService.get<string>('frontend.url');
    const redirectUrl = `${frontendUrl}/auth/callback?accessToken=${tokenResponse.accessToken}&refreshToken=${tokenResponse.refreshToken}`;
    res.redirect(redirectUrl);
  }

  @Post('google/token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '구글 인가코드로 토큰 발급' })
  @ApiResponse({
    status: 200,
    description: '토큰 발급 성공',
    type: TokenResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async googleToken(@Body() dto: OAuthCallbackDto): Promise<TokenResponseDto> {
    const oauthUser = await this.googleService.authenticate(dto.code);
    const user = await this.authService.validateOAuthUser(oauthUser);
    return this.authService.createTokenResponse(user);
  }

  // B-016: 토큰 갱신 API
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '액세스 토큰 갱신' })
  @ApiResponse({
    status: 200,
    description: '토큰 갱신 성공',
    type: TokenResponseDto,
  })
  @ApiResponse({ status: 401, description: '유효하지 않은 리프레시 토큰' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<TokenResponseDto> {
    const result = await this.authService.refreshTokens(dto.refreshToken);
    if (!result) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }
    return result;
  }

  // B-017: 로그아웃 API
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  logout(): { message: string } {
    // JWT 기반 인증에서는 클라이언트가 토큰을 삭제하면 됨
    // 서버 측에서는 별도 처리 없이 성공 응답만 반환
    return { message: '로그아웃되었습니다.' };
  }

  // B-018: 회원탈퇴 API
  @Delete('account')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiResponse({ status: 200, description: '회원 탈퇴 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  async deleteAccount(@CurrentUser() user: User): Promise<{ message: string }> {
    await this.authService.deleteAccount(user.id);
    return { message: '회원 탈퇴가 완료되었습니다.' };
  }

  // B-019: 내 정보 조회 API
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 정보 조회' })
  @ApiResponse({ status: 200, description: '내 정보 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  getProfile(@CurrentUser() user: User): User {
    return user;
  }
}

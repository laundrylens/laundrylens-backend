import {
  Controller,
  Get,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators';
import { SubscriptionResponseDto, SubscriptionStatusResponseDto } from './dto';

@ApiTags('subscription')
@Controller('subscription')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('status')
  @ApiOperation({
    summary: '구독 상태 조회',
    description: '현재 사용자의 구독 상태를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '구독 상태 조회 성공',
    type: SubscriptionStatusResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getSubscriptionStatus(
    @CurrentUser('id') userId: string,
  ): Promise<SubscriptionStatusResponseDto> {
    return this.subscriptionService.getSubscriptionStatus(userId);
  }

  @Get('current')
  @ApiOperation({
    summary: '현재 구독 조회',
    description: '현재 활성화된 구독 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '현재 구독 조회 성공',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getCurrentSubscription(
    @CurrentUser('id') userId: string,
  ): Promise<SubscriptionResponseDto | null> {
    return this.subscriptionService.getCurrentSubscription(userId);
  }

  @Get('history')
  @ApiOperation({
    summary: '구독 내역 조회',
    description: '사용자의 구독 내역을 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '구독 내역 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getSubscriptionHistory(@CurrentUser('id') userId: string) {
    return this.subscriptionService.getSubscriptionHistory(userId);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '구독 취소',
    description: '현재 활성화된 구독을 취소합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '구독 취소 성공',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '활성화된 구독 없음' })
  async cancelSubscription(
    @CurrentUser('id') userId: string,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.cancelSubscription(userId);
  }
}

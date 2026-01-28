import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, Min } from 'class-validator';
import { PlanType, SubscriptionStatus } from '@prisma/client';

export class CreateSubscriptionDto {
  @ApiProperty({ description: '구독 플랜 타입', enum: PlanType })
  @IsEnum(PlanType)
  planType: PlanType;

  @ApiPropertyOptional({
    description: '크레딧 수 (CREDITS 플랜일 경우)',
    example: 10,
  })
  @IsNumber()
  @Min(0)
  credits?: number;
}

export class SubscriptionResponseDto {
  @ApiProperty({ description: '구독 ID' })
  id: string;

  @ApiProperty({ description: '플랜 타입', enum: PlanType })
  planType: PlanType;

  @ApiProperty({ description: '남은 크레딧' })
  credits: number;

  @ApiProperty({ description: '구독 시작일' })
  startedAt: Date;

  @ApiProperty({ description: '구독 만료일' })
  expiresAt: Date;

  @ApiProperty({ description: '구독 상태', enum: SubscriptionStatus })
  status: SubscriptionStatus;

  @ApiProperty({ description: '생성일' })
  createdAt: Date;
}

export class SubscriptionStatusResponseDto {
  @ApiProperty({ description: '프리미엄 여부' })
  isPremium: boolean;

  @ApiPropertyOptional({
    description: '현재 구독 정보',
    type: SubscriptionResponseDto,
  })
  currentSubscription: SubscriptionResponseDto | null;

  @ApiProperty({ description: '남은 무료 분석 횟수' })
  freeAnalysisRemaining: number;

  @ApiPropertyOptional({ description: '남은 크레딧' })
  creditsRemaining: number | null;
}

export class UseCreditsResponseDto {
  @ApiProperty({ description: '성공 여부' })
  success: boolean;

  @ApiProperty({ description: '남은 크레딧' })
  remainingCredits: number;
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PlanType, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../../prisma';

const FREE_ANALYSIS_LIMIT = 3;
const MONTHLY_PLAN_DAYS = 30;

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async createSubscription(
    userId: string,
    planType: PlanType,
    credits: number = 0,
  ) {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + MONTHLY_PLAN_DAYS);

    // 기존 활성 구독이 있으면 취소 처리
    await this.prisma.subscription.updateMany({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
      data: {
        status: SubscriptionStatus.CANCELLED,
      },
    });

    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        planType,
        credits: planType === PlanType.CREDITS ? credits : 0,
        startedAt: now,
        expiresAt,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    // 사용자 프리미엄 상태 업데이트
    await this.prisma.user.update({
      where: { id: userId },
      data: { isPremium: true },
    });

    return subscription;
  }

  async getCurrentSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    return subscription;
  }

  async getSubscriptionStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const currentSubscription = await this.getCurrentSubscription(userId);

    // 무료 분석 횟수 계산 (오늘 사용한 횟수)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayUsageCount = await this.prisma.usageLog.count({
      where: {
        userId,
        action: 'ANALYZE',
        createdAt: { gte: today },
      },
    });

    const freeAnalysisRemaining = Math.max(
      0,
      FREE_ANALYSIS_LIMIT - todayUsageCount,
    );

    return {
      isPremium: user.isPremium,
      currentSubscription,
      freeAnalysisRemaining,
      creditsRemaining: currentSubscription?.credits ?? null,
    };
  }

  async useCredits(userId: string, amount: number = 1) {
    const subscription = await this.getCurrentSubscription(userId);

    if (!subscription) {
      throw new BadRequestException('활성화된 구독이 없습니다.');
    }

    if (subscription.planType !== PlanType.CREDITS) {
      // 월정액 플랜은 크레딧 차감 없음
      return {
        success: true,
        remainingCredits: 0,
      };
    }

    if (subscription.credits < amount) {
      throw new BadRequestException('크레딧이 부족합니다.');
    }

    const updatedSubscription = await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        credits: subscription.credits - amount,
      },
    });

    return {
      success: true,
      remainingCredits: updatedSubscription.credits,
    };
  }

  async cancelSubscription(userId: string) {
    const subscription = await this.getCurrentSubscription(userId);

    if (!subscription) {
      throw new NotFoundException('활성화된 구독이 없습니다.');
    }

    const cancelledSubscription = await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.CANCELLED,
      },
    });

    // 사용자 프리미엄 상태 해제
    await this.prisma.user.update({
      where: { id: userId },
      data: { isPremium: false },
    });

    return cancelledSubscription;
  }

  async getSubscriptionHistory(userId: string) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      subscriptions,
      total: subscriptions.length,
    };
  }

  async canAnalyze(userId?: string, guestId?: string): Promise<boolean> {
    // 비회원: 하루 3회 제한
    if (!userId && guestId) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayUsageCount = await this.prisma.usageLog.count({
        where: {
          guestId,
          action: 'ANALYZE',
          createdAt: { gte: today },
        },
      });

      return todayUsageCount < FREE_ANALYSIS_LIMIT;
    }

    // 회원
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      // 프리미엄 사용자는 무제한
      if (user?.isPremium) {
        const subscription = await this.getCurrentSubscription(userId);
        if (subscription) {
          // 크레딧 플랜이면 크레딧 확인
          if (subscription.planType === PlanType.CREDITS) {
            return subscription.credits > 0;
          }
          // 월정액 플랜이면 무제한
          return true;
        }
      }

      // 무료 회원: 하루 3회 제한
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayUsageCount = await this.prisma.usageLog.count({
        where: {
          userId,
          action: 'ANALYZE',
          createdAt: { gte: today },
        },
      });

      return todayUsageCount < FREE_ANALYSIS_LIMIT;
    }

    return false;
  }
}

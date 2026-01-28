import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentStatus, PlanType } from '@prisma/client';
import { PrismaService } from '../../prisma';
import { TossPaymentsService } from './services';
import { randomUUID } from 'crypto';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tossPaymentsService: TossPaymentsService,
  ) {}

  async createPayment(userId: string, amount: number, planType: PlanType) {
    const orderId = `order_${randomUUID()}`;

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        orderId,
        amount,
        planType,
        status: PaymentStatus.PENDING,
      },
    });

    return payment;
  }

  async confirmPayment(
    userId: string,
    orderId: string,
    paymentKey: string,
    amount: number,
  ) {
    // 결제 정보 확인
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
    });

    if (!payment || payment.userId !== userId) {
      throw new NotFoundException('결제 정보를 찾을 수 없습니다.');
    }

    if (payment.amount !== amount) {
      throw new NotFoundException('결제 금액이 일치하지 않습니다.');
    }

    // 토스페이먼츠 결제 확인
    await this.tossPaymentsService.confirmPayment(paymentKey, orderId, amount);

    // 결제 상태 업데이트
    const updatedPayment = await this.prisma.payment.update({
      where: { orderId },
      data: {
        paymentKey,
        status: PaymentStatus.COMPLETED,
      },
    });

    return updatedPayment;
  }

  async getPaymentHistory(userId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      payments,
      total: payments.length,
    };
  }

  async getPaymentById(userId: string, paymentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, userId },
    });

    if (!payment) {
      throw new NotFoundException('결제 정보를 찾을 수 없습니다.');
    }

    return payment;
  }
}

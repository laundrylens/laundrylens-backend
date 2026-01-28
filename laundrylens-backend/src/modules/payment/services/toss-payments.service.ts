import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface TossPaymentConfirmResponse {
  paymentKey: string;
  orderId: string;
  status: string;
  totalAmount: number;
  approvedAt: string;
}

@Injectable()
export class TossPaymentsService {
  private readonly logger = new Logger(TossPaymentsService.name);
  private readonly secretKey: string;
  private readonly apiUrl = 'https://api.tosspayments.com/v1';

  constructor(private readonly configService: ConfigService) {
    this.secretKey = this.configService.get<string>('toss.secretKey') || '';
  }

  async confirmPayment(
    paymentKey: string,
    orderId: string,
    amount: number,
  ): Promise<TossPaymentConfirmResponse> {
    const encodedKey = Buffer.from(`${this.secretKey}:`).toString('base64');

    try {
      const response = await fetch(`${this.apiUrl}/payments/confirm`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${encodedKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string };
        this.logger.error('토스페이먼츠 결제 확인 실패:', errorData);
        throw new BadRequestException(
          errorData.message || '결제 확인에 실패했습니다.',
        );
      }

      return (await response.json()) as TossPaymentConfirmResponse;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('토스페이먼츠 API 호출 실패:', error);
      throw new BadRequestException('결제 처리 중 오류가 발생했습니다.');
    }
  }

  async cancelPayment(
    paymentKey: string,
    cancelReason: string,
  ): Promise<boolean> {
    const encodedKey = Buffer.from(`${this.secretKey}:`).toString('base64');

    try {
      const response = await fetch(
        `${this.apiUrl}/payments/${paymentKey}/cancel`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${encodedKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cancelReason,
          }),
        },
      );

      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string };
        this.logger.error('토스페이먼츠 결제 취소 실패:', errorData);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('토스페이먼츠 취소 API 호출 실패:', error);
      return false;
    }
  }
}

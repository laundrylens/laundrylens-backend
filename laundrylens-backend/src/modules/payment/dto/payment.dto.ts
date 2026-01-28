import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, Min } from 'class-validator';
import { PaymentStatus, PlanType } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty({ description: '결제 금액', example: 9900 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ description: '구독 플랜 타입', enum: PlanType })
  @IsEnum(PlanType)
  planType: PlanType;
}

export class ConfirmPaymentDto {
  @ApiProperty({ description: '주문 ID' })
  @IsString()
  orderId: string;

  @ApiProperty({ description: '결제 키 (토스페이먼츠)' })
  @IsString()
  paymentKey: string;

  @ApiProperty({ description: '결제 금액' })
  @IsNumber()
  amount: number;
}

export class PaymentResponseDto {
  @ApiProperty({ description: '결제 ID' })
  id: string;

  @ApiProperty({ description: '주문 ID' })
  orderId: string;

  @ApiPropertyOptional({ description: '결제 키', nullable: true })
  paymentKey: string | null;

  @ApiProperty({ description: '결제 금액' })
  amount: number;

  @ApiProperty({ description: '플랜 타입', enum: PlanType })
  planType: PlanType;

  @ApiProperty({ description: '결제 상태', enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty({ description: '생성일' })
  createdAt: Date;
}

export class PaymentListResponseDto {
  @ApiProperty({ description: '결제 목록', type: [PaymentResponseDto] })
  payments: PaymentResponseDto[];

  @ApiProperty({ description: '총 개수' })
  total: number;
}

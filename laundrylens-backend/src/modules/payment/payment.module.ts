import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { TossPaymentsService } from './services';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, TossPaymentsService],
  exports: [PaymentService],
})
export class PaymentModule {}

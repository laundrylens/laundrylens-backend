import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators';
import {
  CreatePaymentDto,
  ConfirmPaymentDto,
  PaymentResponseDto,
  PaymentListResponseDto,
} from './dto';

@ApiTags('payment')
@Controller('payment')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('prepare')
  @ApiOperation({
    summary: '결제 준비',
    description: '결제를 위한 주문 정보를 생성합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '결제 준비 성공',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async preparePayment(
    @CurrentUser('id') userId: string,
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.createPayment(
      userId,
      createPaymentDto.amount,
      createPaymentDto.planType,
    );
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '결제 승인',
    description: '토스페이먼츠 결제를 승인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '결제 승인 성공',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 400, description: '결제 승인 실패' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '결제 정보를 찾을 수 없음' })
  async confirmPayment(
    @CurrentUser('id') userId: string,
    @Body() confirmPaymentDto: ConfirmPaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.confirmPayment(
      userId,
      confirmPaymentDto.orderId,
      confirmPaymentDto.paymentKey,
      confirmPaymentDto.amount,
    );
  }

  @Get('history')
  @ApiOperation({
    summary: '결제 내역 조회',
    description: '사용자의 결제 내역을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '결제 내역 조회 성공',
    type: PaymentListResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getPaymentHistory(
    @CurrentUser('id') userId: string,
  ): Promise<PaymentListResponseDto> {
    return this.paymentService.getPaymentHistory(userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: '결제 상세 조회',
    description: '특정 결제의 상세 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '결제 상세 조회 성공',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '결제 정보를 찾을 수 없음' })
  async getPaymentById(
    @CurrentUser('id') userId: string,
    @Param('id') paymentId: string,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.getPaymentById(userId, paymentId);
  }
}

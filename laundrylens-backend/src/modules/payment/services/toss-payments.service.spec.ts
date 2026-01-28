import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TossPaymentsService } from './toss-payments.service';

describe('TossPaymentsService', () => {
  let service: TossPaymentsService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret-key'),
  };

  const mockPaymentKey = 'payment-key-123';
  const mockOrderId = 'order_test-uuid';
  const mockAmount = 9900;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TossPaymentsService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<TossPaymentsService>(TossPaymentsService);

    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('confirmPayment', () => {
    it('should confirm payment successfully', async () => {
      const mockResponse = {
        paymentKey: mockPaymentKey,
        orderId: mockOrderId,
        status: 'DONE',
        totalAmount: mockAmount,
        approvedAt: '2024-01-15T10:00:00+09:00',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await service.confirmPayment(
        mockPaymentKey,
        mockOrderId,
        mockAmount,
      );

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.tosspayments.com/v1/payments/confirm',

        expect.objectContaining({
          method: 'POST',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            paymentKey: mockPaymentKey,
            orderId: mockOrderId,
            amount: mockAmount,
          }),
        }),
      );
    });

    it('should throw BadRequestException when payment confirmation fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ message: '결제 실패' }),
      });

      await expect(
        service.confirmPayment(mockPaymentKey, mockOrderId, mockAmount),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when fetch throws error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(
        service.confirmPayment(mockPaymentKey, mockOrderId, mockAmount),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelPayment', () => {
    it('should cancel payment successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ status: 'CANCELED' }),
      });

      const result = await service.cancelPayment(mockPaymentKey, '고객 요청');

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.tosspayments.com/v1/payments/${mockPaymentKey}/cancel`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ cancelReason: '고객 요청' }),
        }),
      );
    });

    it('should return false when cancel fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ message: '취소 실패' }),
      });

      const result = await service.cancelPayment(mockPaymentKey, '고객 요청');

      expect(result).toBe(false);
    });

    it('should return false when fetch throws error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await service.cancelPayment(mockPaymentKey, '고객 요청');

      expect(result).toBe(false);
    });
  });
});

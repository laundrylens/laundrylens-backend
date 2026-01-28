import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentStatus, PlanType } from '@prisma/client';
import { CreatePaymentDto, ConfirmPaymentDto } from './dto';

describe('PaymentController', () => {
  let controller: PaymentController;

  const mockPaymentService = {
    createPayment: jest.fn(),
    confirmPayment: jest.fn(),
    getPaymentHistory: jest.fn(),
    getPaymentById: jest.fn(),
  };

  const mockUserId = 'user-123';
  const mockOrderId = 'order_test-uuid';
  const mockPaymentKey = 'payment-key-123';
  const mockAmount = 9900;
  const mockPlanType = PlanType.MONTHLY;

  const mockPayment = {
    id: 'payment-123',
    userId: mockUserId,
    orderId: mockOrderId,
    paymentKey: null,
    amount: mockAmount,
    planType: mockPlanType,
    status: PaymentStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('preparePayment', () => {
    it('should prepare a payment', async () => {
      const createPaymentDto: CreatePaymentDto = {
        amount: mockAmount,
        planType: mockPlanType,
      };

      mockPaymentService.createPayment.mockResolvedValue(mockPayment);

      const result = await controller.preparePayment(
        mockUserId,
        createPaymentDto,
      );

      expect(result).toEqual(mockPayment);
      expect(mockPaymentService.createPayment).toHaveBeenCalledWith(
        mockUserId,
        mockAmount,
        mockPlanType,
      );
    });
  });

  describe('confirmPayment', () => {
    it('should confirm a payment', async () => {
      const confirmPaymentDto: ConfirmPaymentDto = {
        orderId: mockOrderId,
        paymentKey: mockPaymentKey,
        amount: mockAmount,
      };

      const completedPayment = {
        ...mockPayment,
        paymentKey: mockPaymentKey,
        status: PaymentStatus.COMPLETED,
      };

      mockPaymentService.confirmPayment.mockResolvedValue(completedPayment);

      const result = await controller.confirmPayment(
        mockUserId,
        confirmPaymentDto,
      );

      expect(result).toEqual(completedPayment);
      expect(mockPaymentService.confirmPayment).toHaveBeenCalledWith(
        mockUserId,
        mockOrderId,
        mockPaymentKey,
        mockAmount,
      );
    });
  });

  describe('getPaymentHistory', () => {
    it('should return payment history', async () => {
      const mockPaymentHistory = {
        payments: [mockPayment],
        total: 1,
      };

      mockPaymentService.getPaymentHistory.mockResolvedValue(
        mockPaymentHistory,
      );

      const result = await controller.getPaymentHistory(mockUserId);

      expect(result).toEqual(mockPaymentHistory);
      expect(mockPaymentService.getPaymentHistory).toHaveBeenCalledWith(
        mockUserId,
      );
    });
  });

  describe('getPaymentById', () => {
    it('should return payment by id', async () => {
      mockPaymentService.getPaymentById.mockResolvedValue(mockPayment);

      const result = await controller.getPaymentById(mockUserId, 'payment-123');

      expect(result).toEqual(mockPayment);
      expect(mockPaymentService.getPaymentById).toHaveBeenCalledWith(
        mockUserId,
        'payment-123',
      );
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PrismaService } from '../../prisma';
import { TossPaymentsService } from './services';
import { PaymentStatus, PlanType } from '@prisma/client';

describe('PaymentService', () => {
  let service: PaymentService;

  const mockPrismaService = {
    payment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockTossPaymentsService = {
    confirmPayment: jest.fn(),
    cancelPayment: jest.fn(),
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
      providers: [
        PaymentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: TossPaymentsService,
          useValue: mockTossPaymentsService,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPayment', () => {
    it('should create a new payment', async () => {
      mockPrismaService.payment.create.mockResolvedValue(mockPayment);

      const result = await service.createPayment(
        mockUserId,
        mockAmount,
        mockPlanType,
      );

      expect(result).toEqual(mockPayment);
      expect(mockPrismaService.payment.create).toHaveBeenCalledWith({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: expect.objectContaining({
          userId: mockUserId,
          amount: mockAmount,
          planType: mockPlanType,
          status: PaymentStatus.PENDING,
        }),
      });
    });

    it('should generate unique orderId for each payment', async () => {
      mockPrismaService.payment.create.mockResolvedValue(mockPayment);

      await service.createPayment(mockUserId, mockAmount, mockPlanType);

      expect(mockPrismaService.payment.create).toHaveBeenCalledWith({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          orderId: expect.stringMatching(/^order_/),
        }),
      });
    });
  });

  describe('confirmPayment', () => {
    it('should confirm payment successfully', async () => {
      const completedPayment = {
        ...mockPayment,
        paymentKey: mockPaymentKey,
        status: PaymentStatus.COMPLETED,
      };

      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
      mockTossPaymentsService.confirmPayment.mockResolvedValue({
        paymentKey: mockPaymentKey,
        orderId: mockOrderId,
        status: 'DONE',
        totalAmount: mockAmount,
        approvedAt: new Date().toISOString(),
      });
      mockPrismaService.payment.update.mockResolvedValue(completedPayment);

      const result = await service.confirmPayment(
        mockUserId,
        mockOrderId,
        mockPaymentKey,
        mockAmount,
      );

      expect(result).toEqual(completedPayment);
      expect(mockTossPaymentsService.confirmPayment).toHaveBeenCalledWith(
        mockPaymentKey,
        mockOrderId,
        mockAmount,
      );
      expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
        where: { orderId: mockOrderId },
        data: {
          paymentKey: mockPaymentKey,
          status: PaymentStatus.COMPLETED,
        },
      });
    });

    it('should throw NotFoundException when payment not found', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);

      await expect(
        service.confirmPayment(
          mockUserId,
          mockOrderId,
          mockPaymentKey,
          mockAmount,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when userId does not match', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue({
        ...mockPayment,
        userId: 'different-user',
      });

      await expect(
        service.confirmPayment(
          mockUserId,
          mockOrderId,
          mockPaymentKey,
          mockAmount,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when amount does not match', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);

      await expect(
        service.confirmPayment(mockUserId, mockOrderId, mockPaymentKey, 5000),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPaymentHistory', () => {
    it('should return payment history for user', async () => {
      const mockPayments = [mockPayment, { ...mockPayment, id: 'payment-456' }];
      mockPrismaService.payment.findMany.mockResolvedValue(mockPayments);

      const result = await service.getPaymentHistory(mockUserId);

      expect(result).toEqual({
        payments: mockPayments,
        total: 2,
      });
      expect(mockPrismaService.payment.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no payments found', async () => {
      mockPrismaService.payment.findMany.mockResolvedValue([]);

      const result = await service.getPaymentHistory(mockUserId);

      expect(result).toEqual({
        payments: [],
        total: 0,
      });
    });
  });

  describe('getPaymentById', () => {
    it('should return payment by id', async () => {
      mockPrismaService.payment.findFirst.mockResolvedValue(mockPayment);

      const result = await service.getPaymentById(mockUserId, 'payment-123');

      expect(result).toEqual(mockPayment);
      expect(mockPrismaService.payment.findFirst).toHaveBeenCalledWith({
        where: { id: 'payment-123', userId: mockUserId },
      });
    });

    it('should throw NotFoundException when payment not found', async () => {
      mockPrismaService.payment.findFirst.mockResolvedValue(null);

      await expect(
        service.getPaymentById(mockUserId, 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

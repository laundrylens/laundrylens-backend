import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { PlanType, SubscriptionStatus } from '@prisma/client';

describe('SubscriptionController', () => {
  let controller: SubscriptionController;

  const mockSubscriptionService = {
    getSubscriptionStatus: jest.fn(),
    getCurrentSubscription: jest.fn(),
    getSubscriptionHistory: jest.fn(),
    cancelSubscription: jest.fn(),
  };

  const mockUserId = 'user-123';
  const mockSubscription = {
    id: 'subscription-123',
    userId: mockUserId,
    planType: PlanType.MONTHLY,
    credits: 0,
    startedAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: SubscriptionStatus.ACTIVE,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionController],
      providers: [
        {
          provide: SubscriptionService,
          useValue: mockSubscriptionService,
        },
      ],
    }).compile();

    controller = module.get<SubscriptionController>(SubscriptionController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSubscriptionStatus', () => {
    it('should return subscription status', async () => {
      const mockStatus = {
        isPremium: true,
        currentSubscription: mockSubscription,
        freeAnalysisRemaining: 3,
        creditsRemaining: null,
      };
      mockSubscriptionService.getSubscriptionStatus.mockResolvedValue(
        mockStatus,
      );

      const result = await controller.getSubscriptionStatus(mockUserId);

      expect(result).toEqual(mockStatus);
      expect(
        mockSubscriptionService.getSubscriptionStatus,
      ).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('getCurrentSubscription', () => {
    it('should return current subscription', async () => {
      mockSubscriptionService.getCurrentSubscription.mockResolvedValue(
        mockSubscription,
      );

      const result = await controller.getCurrentSubscription(mockUserId);

      expect(result).toEqual(mockSubscription);
      expect(
        mockSubscriptionService.getCurrentSubscription,
      ).toHaveBeenCalledWith(mockUserId);
    });

    it('should return null when no active subscription', async () => {
      mockSubscriptionService.getCurrentSubscription.mockResolvedValue(null);

      const result = await controller.getCurrentSubscription(mockUserId);

      expect(result).toBeNull();
    });
  });

  describe('getSubscriptionHistory', () => {
    it('should return subscription history', async () => {
      const mockHistory = {
        subscriptions: [mockSubscription],
        total: 1,
      };
      mockSubscriptionService.getSubscriptionHistory.mockResolvedValue(
        mockHistory,
      );

      const result = await controller.getSubscriptionHistory(mockUserId);

      expect(result).toEqual(mockHistory);
      expect(
        mockSubscriptionService.getSubscriptionHistory,
      ).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription', async () => {
      const cancelledSubscription = {
        ...mockSubscription,
        status: SubscriptionStatus.CANCELLED,
      };
      mockSubscriptionService.cancelSubscription.mockResolvedValue(
        cancelledSubscription,
      );

      const result = await controller.cancelSubscription(mockUserId);

      expect(result.status).toBe(SubscriptionStatus.CANCELLED);
      expect(mockSubscriptionService.cancelSubscription).toHaveBeenCalledWith(
        mockUserId,
      );
    });
  });
});

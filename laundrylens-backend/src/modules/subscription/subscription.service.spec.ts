import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { PrismaService } from '../../prisma';
import { PlanType, SubscriptionStatus } from '@prisma/client';

describe('SubscriptionService', () => {
  let service: SubscriptionService;

  const mockPrismaService = {
    subscription: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    usageLog: {
      count: jest.fn(),
    },
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

  const mockUser = {
    id: mockUserId,
    email: 'test@example.com',
    nickname: 'Test User',
    isPremium: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSubscription', () => {
    it('should create a new subscription', async () => {
      mockPrismaService.subscription.updateMany.mockResolvedValue({ count: 0 });
      mockPrismaService.subscription.create.mockResolvedValue(mockSubscription);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        isPremium: true,
      });

      const result = await service.createSubscription(
        mockUserId,
        PlanType.MONTHLY,
      );

      expect(result).toEqual(mockSubscription);
      expect(mockPrismaService.subscription.updateMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          status: SubscriptionStatus.ACTIVE,
        },
        data: {
          status: SubscriptionStatus.CANCELLED,
        },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { isPremium: true },
      });
    });

    it('should create subscription with credits for CREDITS plan', async () => {
      const creditsSubscription = {
        ...mockSubscription,
        planType: PlanType.CREDITS,
        credits: 10,
      };
      mockPrismaService.subscription.updateMany.mockResolvedValue({ count: 0 });
      mockPrismaService.subscription.create.mockResolvedValue(
        creditsSubscription,
      );
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        isPremium: true,
      });

      const result = await service.createSubscription(
        mockUserId,
        PlanType.CREDITS,
        10,
      );

      expect(result.credits).toBe(10);
      expect(result.planType).toBe(PlanType.CREDITS);
    });
  });

  describe('getCurrentSubscription', () => {
    it('should return current active subscription', async () => {
      mockPrismaService.subscription.findFirst.mockResolvedValue(
        mockSubscription,
      );

      const result = await service.getCurrentSubscription(mockUserId);

      expect(result).toEqual(mockSubscription);
    });

    it('should return null when no active subscription', async () => {
      mockPrismaService.subscription.findFirst.mockResolvedValue(null);

      const result = await service.getCurrentSubscription(mockUserId);

      expect(result).toBeNull();
    });
  });

  describe('getSubscriptionStatus', () => {
    it('should return subscription status for user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.subscription.findFirst.mockResolvedValue(null);
      mockPrismaService.usageLog.count.mockResolvedValue(1);

      const result = await service.getSubscriptionStatus(mockUserId);

      expect(result).toEqual({
        isPremium: false,
        currentSubscription: null,
        freeAnalysisRemaining: 2,
        creditsRemaining: null,
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getSubscriptionStatus(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('useCredits', () => {
    it('should use credits from CREDITS plan', async () => {
      const creditsSubscription = {
        ...mockSubscription,
        planType: PlanType.CREDITS,
        credits: 5,
      };
      mockPrismaService.subscription.findFirst.mockResolvedValue(
        creditsSubscription,
      );
      mockPrismaService.subscription.update.mockResolvedValue({
        ...creditsSubscription,
        credits: 4,
      });

      const result = await service.useCredits(mockUserId, 1);

      expect(result).toEqual({
        success: true,
        remainingCredits: 4,
      });
    });

    it('should return success without deduction for MONTHLY plan', async () => {
      mockPrismaService.subscription.findFirst.mockResolvedValue(
        mockSubscription,
      );

      const result = await service.useCredits(mockUserId, 1);

      expect(result).toEqual({
        success: true,
        remainingCredits: 0,
      });
    });

    it('should throw BadRequestException when no active subscription', async () => {
      mockPrismaService.subscription.findFirst.mockResolvedValue(null);

      await expect(service.useCredits(mockUserId, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when not enough credits', async () => {
      const creditsSubscription = {
        ...mockSubscription,
        planType: PlanType.CREDITS,
        credits: 0,
      };
      mockPrismaService.subscription.findFirst.mockResolvedValue(
        creditsSubscription,
      );

      await expect(service.useCredits(mockUserId, 1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel active subscription', async () => {
      const cancelledSubscription = {
        ...mockSubscription,
        status: SubscriptionStatus.CANCELLED,
      };
      mockPrismaService.subscription.findFirst.mockResolvedValue(
        mockSubscription,
      );
      mockPrismaService.subscription.update.mockResolvedValue(
        cancelledSubscription,
      );
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        isPremium: false,
      });

      const result = await service.cancelSubscription(mockUserId);

      expect(result.status).toBe(SubscriptionStatus.CANCELLED);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { isPremium: false },
      });
    });

    it('should throw NotFoundException when no active subscription', async () => {
      mockPrismaService.subscription.findFirst.mockResolvedValue(null);

      await expect(service.cancelSubscription(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getSubscriptionHistory', () => {
    it('should return subscription history', async () => {
      const mockSubscriptions = [mockSubscription];
      mockPrismaService.subscription.findMany.mockResolvedValue(
        mockSubscriptions,
      );

      const result = await service.getSubscriptionHistory(mockUserId);

      expect(result).toEqual({
        subscriptions: mockSubscriptions,
        total: 1,
      });
    });
  });

  describe('canAnalyze', () => {
    it('should allow guest with less than 3 daily analyses', async () => {
      mockPrismaService.usageLog.count.mockResolvedValue(2);

      const result = await service.canAnalyze(undefined, 'guest-123');

      expect(result).toBe(true);
    });

    it('should deny guest with 3 or more daily analyses', async () => {
      mockPrismaService.usageLog.count.mockResolvedValue(3);

      const result = await service.canAnalyze(undefined, 'guest-123');

      expect(result).toBe(false);
    });

    it('should allow premium user with MONTHLY plan', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        isPremium: true,
      });
      mockPrismaService.subscription.findFirst.mockResolvedValue(
        mockSubscription,
      );

      const result = await service.canAnalyze(mockUserId);

      expect(result).toBe(true);
    });

    it('should deny premium user with CREDITS plan and no credits', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        isPremium: true,
      });
      mockPrismaService.subscription.findFirst.mockResolvedValue({
        ...mockSubscription,
        planType: PlanType.CREDITS,
        credits: 0,
      });

      const result = await service.canAnalyze(mockUserId);

      expect(result).toBe(false);
    });

    it('should allow free user with less than 3 daily analyses', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.subscription.findFirst.mockResolvedValue(null);
      mockPrismaService.usageLog.count.mockResolvedValue(2);

      const result = await service.canAnalyze(mockUserId);

      expect(result).toBe(true);
    });

    it('should return false when no userId and no guestId', async () => {
      const result = await service.canAnalyze();

      expect(result).toBe(false);
    });
  });
});

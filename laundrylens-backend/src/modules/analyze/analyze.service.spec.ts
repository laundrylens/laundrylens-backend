import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { AnalyzeService } from './analyze.service';
import { OpenAIVisionService } from './services';
import { PrismaService } from '../../prisma';

describe('AnalyzeService', () => {
  let service: AnalyzeService;

  const mockVisionResult = {
    symbols: [
      { code: 'WASH_30', confidence: 0.95 },
      { code: 'BLEACH_NO', confidence: 0.88 },
    ],
    careTips: '손세탁 권장',
  };

  const mockSymbol = {
    id: 'symbol-id-1',
    category: 'WASH',
    code: 'WASH_30',
    iconUrl: null,
    createdAt: new Date(),
  };

  const mockOpenAIVisionService = {
    analyzeImage: jest.fn(),
  };

  const mockPrismaService = {
    laundrySymbol: {
      findUnique: jest.fn(),
    },
    usageLog: {
      create: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyzeService,
        { provide: OpenAIVisionService, useValue: mockOpenAIVisionService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AnalyzeService>(AnalyzeService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('analyzeImage', () => {
    it('should analyze image and return results', async () => {
      const imageBuffer = Buffer.from('test-image');
      const guestId = 'guest-123';

      mockPrismaService.usageLog.count.mockResolvedValue(0);
      mockOpenAIVisionService.analyzeImage.mockResolvedValue(mockVisionResult);
      mockPrismaService.laundrySymbol.findUnique.mockResolvedValue(mockSymbol);
      mockPrismaService.usageLog.create.mockResolvedValue({});

      const result = await service.analyzeImage(imageBuffer, guestId);

      expect(result.detectedSymbols).toHaveLength(2);
      expect(result.careTips).toBe('손세탁 권장');
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
      expect(mockOpenAIVisionService.analyzeImage).toHaveBeenCalled();
    });

    it('should match symbols with database', async () => {
      const imageBuffer = Buffer.from('test-image');
      const guestId = 'guest-123';

      mockPrismaService.usageLog.count.mockResolvedValue(0);
      mockOpenAIVisionService.analyzeImage.mockResolvedValue(mockVisionResult);
      mockPrismaService.laundrySymbol.findUnique.mockResolvedValueOnce(
        mockSymbol,
      );
      mockPrismaService.laundrySymbol.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.usageLog.create.mockResolvedValue({});

      const result = await service.analyzeImage(imageBuffer, guestId);

      expect(result.detectedSymbols[0].symbolId).toBe('symbol-id-1');
      expect(result.detectedSymbols[1].symbolId).toBeUndefined();
    });

    it('should log usage after analysis', async () => {
      const imageBuffer = Buffer.from('test-image');
      const guestId = 'guest-123';

      mockPrismaService.usageLog.count.mockResolvedValue(0);
      mockOpenAIVisionService.analyzeImage.mockResolvedValue(mockVisionResult);
      mockPrismaService.laundrySymbol.findUnique.mockResolvedValue(mockSymbol);
      mockPrismaService.usageLog.create.mockResolvedValue({});

      await service.analyzeImage(imageBuffer, guestId);

      expect(mockPrismaService.usageLog.create).toHaveBeenCalledWith({
        data: {
          guestId: 'guest-123',
          action: 'ANALYZE_IMAGE',
        },
      });
    });

    it('should throw ForbiddenException when daily limit exceeded', async () => {
      const imageBuffer = Buffer.from('test-image');
      const guestId = 'guest-123';

      mockPrismaService.usageLog.count.mockResolvedValue(5);

      await expect(service.analyzeImage(imageBuffer, guestId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getRemainingAnalyses', () => {
    it('should return remaining analyses count', async () => {
      const guestId = 'guest-123';
      mockPrismaService.usageLog.count.mockResolvedValue(2);

      const result = await service.getRemainingAnalyses(guestId);

      expect(result.remaining).toBe(3);
      expect(result.dailyLimit).toBe(5);
      expect(result.resetAt).toBeDefined();
    });

    it('should return 0 when all analyses used', async () => {
      const guestId = 'guest-123';
      mockPrismaService.usageLog.count.mockResolvedValue(5);

      const result = await service.getRemainingAnalyses(guestId);

      expect(result.remaining).toBe(0);
    });

    it('should return full limit for new guest', async () => {
      const guestId = 'new-guest';
      mockPrismaService.usageLog.count.mockResolvedValue(0);

      const result = await service.getRemainingAnalyses(guestId);

      expect(result.remaining).toBe(5);
    });
  });
});

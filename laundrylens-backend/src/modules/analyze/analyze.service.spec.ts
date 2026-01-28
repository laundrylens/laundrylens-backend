import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
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

  const mockAnalysisHistory = {
    id: 'history-id-1',
    userId: 'user-id-1',
    guestId: null,
    imageUrl: 'data:image/jpeg;base64,...',
    result: mockVisionResult.symbols,
    createdAt: new Date(),
  };

  const mockOpenAIVisionService = {
    analyzeImage: jest.fn(),
  };

  const mockPrismaService = {
    laundrySymbol: {
      findUnique: jest.fn(),
    },
    analysisHistory: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    usageLog: {
      create: jest.fn(),
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

      mockOpenAIVisionService.analyzeImage.mockResolvedValue(mockVisionResult);
      mockPrismaService.laundrySymbol.findUnique.mockResolvedValue(mockSymbol);
      mockPrismaService.analysisHistory.create.mockResolvedValue(
        mockAnalysisHistory,
      );
      mockPrismaService.usageLog.create.mockResolvedValue({});

      const result = await service.analyzeImage(imageBuffer);

      expect(result.detectedSymbols).toHaveLength(2);
      expect(result.careTips).toBe('손세탁 권장');
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
      expect(mockOpenAIVisionService.analyzeImage).toHaveBeenCalled();
    });

    it('should match symbols with database', async () => {
      const imageBuffer = Buffer.from('test-image');

      mockOpenAIVisionService.analyzeImage.mockResolvedValue(mockVisionResult);
      mockPrismaService.laundrySymbol.findUnique.mockResolvedValueOnce(
        mockSymbol,
      );
      mockPrismaService.laundrySymbol.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.analysisHistory.create.mockResolvedValue(
        mockAnalysisHistory,
      );
      mockPrismaService.usageLog.create.mockResolvedValue({});

      const result = await service.analyzeImage(imageBuffer);

      expect(result.detectedSymbols[0].symbolId).toBe('symbol-id-1');
      expect(result.detectedSymbols[1].symbolId).toBeUndefined();
    });

    it('should save analysis history for authenticated user', async () => {
      const imageBuffer = Buffer.from('test-image');
      const userId = 'user-id-1';

      mockOpenAIVisionService.analyzeImage.mockResolvedValue(mockVisionResult);
      mockPrismaService.laundrySymbol.findUnique.mockResolvedValue(mockSymbol);
      mockPrismaService.analysisHistory.create.mockResolvedValue(
        mockAnalysisHistory,
      );
      mockPrismaService.usageLog.create.mockResolvedValue({});

      await service.analyzeImage(imageBuffer, userId);

      expect(mockPrismaService.analysisHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.objectContaining({
            userId,
          }),
        }),
      );
    });
  });

  describe('getAnalysisHistory', () => {
    it('should return user analysis history list', async () => {
      mockPrismaService.analysisHistory.findMany.mockResolvedValue([
        mockAnalysisHistory,
      ]);

      const result = await service.getAnalysisHistory('user-id-1');

      expect(result.histories).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.histories[0].id).toBe('history-id-1');
      expect(mockPrismaService.analysisHistory.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-id-1' },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    });

    it('should return empty list when no history found', async () => {
      mockPrismaService.analysisHistory.findMany.mockResolvedValue([]);

      const result = await service.getAnalysisHistory('user-id-1');

      expect(result.histories).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('getAnalysisHistoryById', () => {
    it('should return analysis history by id', async () => {
      mockPrismaService.analysisHistory.findFirst.mockResolvedValue(
        mockAnalysisHistory,
      );

      const result = await service.getAnalysisHistoryById(
        'user-id-1',
        'history-id-1',
      );

      expect(result.id).toBe('history-id-1');
      expect(result.userId).toBe('user-id-1');
      expect(result.imageUrl).toBe(mockAnalysisHistory.imageUrl);
      expect(mockPrismaService.analysisHistory.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'history-id-1',
          userId: 'user-id-1',
        },
      });
    });

    it('should throw NotFoundException when history not found', async () => {
      mockPrismaService.analysisHistory.findFirst.mockResolvedValue(null);

      await expect(
        service.getAnalysisHistoryById('user-id-1', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should not return other user history', async () => {
      mockPrismaService.analysisHistory.findFirst.mockResolvedValue(null);

      await expect(
        service.getAnalysisHistoryById('other-user', 'history-id-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

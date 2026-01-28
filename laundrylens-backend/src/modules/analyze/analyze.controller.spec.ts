import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AnalyzeController } from './analyze.controller';
import { AnalyzeService } from './analyze.service';

describe('AnalyzeController', () => {
  let controller: AnalyzeController;

  const mockAnalyzeResult = {
    detectedSymbols: [
      { code: 'WASH_30', confidence: 0.95, symbolId: 'symbol-1' },
    ],
    imageUrl: 'data:image/jpeg;base64,...',
    careTips: '손세탁 권장',
    processingTime: 1500,
  };

  const mockAnalysisHistory = {
    id: 'history-id-1',
    userId: 'user-id-1',
    guestId: null,
    imageUrl: 'data:image/jpeg;base64,...',
    result: [{ code: 'WASH_30', confidence: 0.95 }],
    createdAt: new Date(),
  };

  const mockAnalyzeService = {
    analyzeImage: jest.fn(),
    getAnalysisHistory: jest.fn(),
    getAnalysisHistoryById: jest.fn(),
  };

  const mockUser = {
    id: 'user-id-1',
    email: 'test@example.com',
    name: 'Test User',
    provider: 'KAKAO',
    providerId: '12345',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyzeController],
      providers: [
        {
          provide: AnalyzeService,
          useValue: mockAnalyzeService,
        },
      ],
    }).compile();

    controller = module.get<AnalyzeController>(AnalyzeController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('analyze', () => {
    it('should analyze image for guest user', async () => {
      const mockFile = {
        buffer: Buffer.from('test-image'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      mockAnalyzeService.analyzeImage.mockResolvedValue(mockAnalyzeResult);

      const result = await controller.analyze(mockFile);

      expect(result).toEqual(mockAnalyzeResult);
      expect(mockAnalyzeService.analyzeImage).toHaveBeenCalledWith(
        mockFile.buffer,
      );
    });

    it('should throw BadRequestException when no file uploaded', async () => {
      await expect(
        controller.analyze(undefined as unknown as Express.Multer.File),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('analyzeAuthenticated', () => {
    it('should analyze image for authenticated user', async () => {
      const mockFile = {
        buffer: Buffer.from('test-image'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      mockAnalyzeService.analyzeImage.mockResolvedValue(mockAnalyzeResult);

      const result = await controller.analyzeAuthenticated(
        mockFile,
        mockUser as any,
      );

      expect(result).toEqual(mockAnalyzeResult);
      expect(mockAnalyzeService.analyzeImage).toHaveBeenCalledWith(
        mockFile.buffer,
        'user-id-1',
      );
    });

    it('should throw BadRequestException when no file uploaded', async () => {
      await expect(
        controller.analyzeAuthenticated(
          undefined as unknown as Express.Multer.File,

          mockUser as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getHistory', () => {
    it('should return user analysis history list', async () => {
      const mockResponse = {
        histories: [mockAnalysisHistory],
        total: 1,
      };
      mockAnalyzeService.getAnalysisHistory.mockResolvedValue(mockResponse);

      const result = await controller.getHistory(mockUser as any);

      expect(result).toEqual(mockResponse);
      expect(mockAnalyzeService.getAnalysisHistory).toHaveBeenCalledWith(
        'user-id-1',
      );
    });
  });

  describe('getHistoryById', () => {
    it('should return analysis history by id', async () => {
      mockAnalyzeService.getAnalysisHistoryById.mockResolvedValue(
        mockAnalysisHistory,
      );

      const result = await controller.getHistoryById(
        mockUser as any,
        'history-id-1',
      );

      expect(result).toEqual(mockAnalysisHistory);
      expect(mockAnalyzeService.getAnalysisHistoryById).toHaveBeenCalledWith(
        'user-id-1',
        'history-id-1',
      );
    });

    it('should throw NotFoundException when history not found', async () => {
      mockAnalyzeService.getAnalysisHistoryById.mockRejectedValue(
        new NotFoundException('분석 이력을 찾을 수 없습니다.'),
      );

      await expect(
        controller.getHistoryById(mockUser as any, 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

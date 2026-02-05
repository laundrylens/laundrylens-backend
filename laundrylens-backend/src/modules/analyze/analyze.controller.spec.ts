import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { AnalyzeController } from './analyze.controller';
import { AnalyzeService } from './analyze.service';

describe('AnalyzeController', () => {
  let controller: AnalyzeController;

  const mockAnalyzeResult = {
    detectedSymbols: [
      { code: 'WASH_30', confidence: 0.95, symbolId: 'symbol-1' },
    ],
    careTips: '손세탁 권장',
    processingTime: 1500,
  };

  const mockRemainingAnalyses = {
    remaining: 3,
    dailyLimit: 5,
    resetAt: new Date().toISOString(),
  };

  const mockAnalyzeService = {
    analyzeImage: jest.fn(),
    getRemainingAnalyses: jest.fn(),
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
    it('should analyze image successfully', async () => {
      const mockFile = {
        buffer: Buffer.from('test-image'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File;
      const guestId = 'guest-123';

      mockAnalyzeService.analyzeImage.mockResolvedValue(mockAnalyzeResult);

      const result = await controller.analyze(mockFile, guestId);

      expect(result).toEqual(mockAnalyzeResult);
      expect(mockAnalyzeService.analyzeImage).toHaveBeenCalledWith(
        mockFile.buffer,
        guestId,
      );
    });

    it('should throw BadRequestException when no file uploaded', async () => {
      await expect(
        controller.analyze(
          undefined as unknown as Express.Multer.File,
          'guest-123',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when no guestId provided', async () => {
      const mockFile = {
        buffer: Buffer.from('test-image'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      await expect(
        controller.analyze(mockFile, undefined as unknown as string),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when daily limit exceeded', async () => {
      const mockFile = {
        buffer: Buffer.from('test-image'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File;
      const guestId = 'guest-123';

      mockAnalyzeService.analyzeImage.mockRejectedValue(
        new ForbiddenException('일일 분석 횟수 초과'),
      );

      await expect(controller.analyze(mockFile, guestId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getRemaining', () => {
    it('should return remaining analyses count', async () => {
      const guestId = 'guest-123';

      mockAnalyzeService.getRemainingAnalyses.mockResolvedValue(
        mockRemainingAnalyses,
      );

      const result = await controller.getRemaining(guestId);

      expect(result).toEqual(mockRemainingAnalyses);
      expect(mockAnalyzeService.getRemainingAnalyses).toHaveBeenCalledWith(
        guestId,
      );
    });

    it('should throw BadRequestException when no guestId provided', async () => {
      await expect(
        controller.getRemaining(undefined as unknown as string),
      ).rejects.toThrow(BadRequestException);
    });
  });
});

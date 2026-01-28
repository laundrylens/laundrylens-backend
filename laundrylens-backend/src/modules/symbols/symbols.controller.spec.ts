import { Test, TestingModule } from '@nestjs/testing';
import { SymbolCategory } from '@prisma/client';
import { SymbolsController } from './symbols.controller';
import { SymbolsService } from './symbols.service';

describe('SymbolsController', () => {
  let controller: SymbolsController;

  const mockSymbol = {
    id: 'symbol-id-1',
    category: SymbolCategory.WASH,
    code: 'WASH_NORMAL',
    iconUrl: 'https://example.com/icon.svg',
    createdAt: new Date(),
  };

  const mockSymbolWithTranslations = {
    ...mockSymbol,
    translations: [
      {
        id: 'trans-id-1',
        symbolId: 'symbol-id-1',
        countryCode: 'ko',
        name: '물세탁 가능',
        shortDesc: '물로 세탁할 수 있습니다',
        detailDesc: '일반 세탁기 사용 가능',
      },
    ],
  };

  const mockSymbolsService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByCode: jest.fn(),
    findByCategory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SymbolsController],
      providers: [{ provide: SymbolsService, useValue: mockSymbolsService }],
    }).compile();

    controller = module.get<SymbolsController>(SymbolsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return symbols list', async () => {
      const expectedResult = { symbols: [mockSymbol], total: 1 };
      mockSymbolsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll({});

      expect(result).toEqual(expectedResult);
      expect(mockSymbolsService.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should filter by category', async () => {
      const expectedResult = { symbols: [mockSymbol], total: 1 };
      mockSymbolsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll({
        category: SymbolCategory.WASH,
      });

      expect(result).toEqual(expectedResult);
      expect(mockSymbolsService.findAll).toHaveBeenCalledWith(
        SymbolCategory.WASH,
      );
    });
  });

  describe('findOne', () => {
    it('should return symbol detail', async () => {
      mockSymbolsService.findById.mockResolvedValue(mockSymbolWithTranslations);

      const result = await controller.findOne('symbol-id-1');

      expect(result).toEqual(mockSymbolWithTranslations);
      expect(mockSymbolsService.findById).toHaveBeenCalledWith(
        'symbol-id-1',
        undefined,
      );
    });

    it('should use custom language', async () => {
      mockSymbolsService.findById.mockResolvedValue(mockSymbolWithTranslations);

      const result = await controller.findOne('symbol-id-1', 'en');

      expect(result).toEqual(mockSymbolWithTranslations);
      expect(mockSymbolsService.findById).toHaveBeenCalledWith(
        'symbol-id-1',
        'en',
      );
    });
  });
});

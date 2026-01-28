import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SymbolCategory } from '@prisma/client';
import { SymbolsService } from './symbols.service';
import { PrismaService } from '../../prisma';

describe('SymbolsService', () => {
  let service: SymbolsService;

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

  const mockPrismaService = {
    laundrySymbol: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SymbolsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SymbolsService>(SymbolsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all symbols', async () => {
      mockPrismaService.laundrySymbol.findMany.mockResolvedValue([mockSymbol]);
      mockPrismaService.laundrySymbol.count.mockResolvedValue(1);

      const result = await service.findAll();

      expect(result).toEqual({
        symbols: [mockSymbol],
        total: 1,
      });
      expect(mockPrismaService.laundrySymbol.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: [{ category: 'asc' }, { code: 'asc' }],
      });
    });

    it('should filter by category', async () => {
      mockPrismaService.laundrySymbol.findMany.mockResolvedValue([mockSymbol]);
      mockPrismaService.laundrySymbol.count.mockResolvedValue(1);

      const result = await service.findAll(SymbolCategory.WASH);

      expect(result).toEqual({
        symbols: [mockSymbol],
        total: 1,
      });
      expect(mockPrismaService.laundrySymbol.findMany).toHaveBeenCalledWith({
        where: { category: SymbolCategory.WASH },
        orderBy: [{ category: 'asc' }, { code: 'asc' }],
      });
    });
  });

  describe('findById', () => {
    it('should return symbol with translations', async () => {
      mockPrismaService.laundrySymbol.findUnique.mockResolvedValue(
        mockSymbolWithTranslations,
      );

      const result = await service.findById('symbol-id-1');

      expect(result).toEqual(mockSymbolWithTranslations);
      expect(mockPrismaService.laundrySymbol.findUnique).toHaveBeenCalledWith({
        where: { id: 'symbol-id-1' },
        include: {
          translations: {
            where: { countryCode: 'ko' },
          },
        },
      });
    });

    it('should use custom language', async () => {
      mockPrismaService.laundrySymbol.findUnique.mockResolvedValue(
        mockSymbolWithTranslations,
      );

      await service.findById('symbol-id-1', 'en');

      expect(mockPrismaService.laundrySymbol.findUnique).toHaveBeenCalledWith({
        where: { id: 'symbol-id-1' },
        include: {
          translations: {
            where: { countryCode: 'en' },
          },
        },
      });
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.laundrySymbol.findUnique.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByCode', () => {
    it('should return symbol by code', async () => {
      mockPrismaService.laundrySymbol.findUnique.mockResolvedValue(
        mockSymbolWithTranslations,
      );

      const result = await service.findByCode('WASH_NORMAL');

      expect(result).toEqual(mockSymbolWithTranslations);
      expect(mockPrismaService.laundrySymbol.findUnique).toHaveBeenCalledWith({
        where: { code: 'WASH_NORMAL' },
        include: {
          translations: {
            where: { countryCode: 'ko' },
          },
        },
      });
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.laundrySymbol.findUnique.mockResolvedValue(null);

      await expect(service.findByCode('INVALID_CODE')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByCategory', () => {
    it('should return symbols by category with translations', async () => {
      mockPrismaService.laundrySymbol.findMany.mockResolvedValue([
        mockSymbolWithTranslations,
      ]);

      const result = await service.findByCategory(SymbolCategory.WASH);

      expect(result).toEqual([mockSymbolWithTranslations]);
      expect(mockPrismaService.laundrySymbol.findMany).toHaveBeenCalledWith({
        where: { category: SymbolCategory.WASH },
        include: {
          translations: {
            where: { countryCode: 'ko' },
          },
        },
        orderBy: { code: 'asc' },
      });
    });
  });

  describe('getSupportedCountries', () => {
    it('should return list of supported countries', () => {
      const result = service.getSupportedCountries();

      expect(result.countries).toHaveLength(3);
      expect(result.countries[0]).toEqual({
        code: 'ko',
        nameKo: '한국어',
        nameEn: 'Korean',
      });
    });
  });
});

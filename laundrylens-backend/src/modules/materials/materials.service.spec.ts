import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { PrismaService } from '../../prisma';
import { Frequency, SymbolCategory } from '@prisma/client';

describe('MaterialsService', () => {
  let service: MaterialsService;

  const mockPrismaService = {
    material: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockMaterial = {
    id: 'material-1',
    code: 'COTTON',
    nameKo: '면',
    nameEn: 'Cotton',
    nameJp: '綿',
    description: '천연 식물성 섬유',
    careTips: '물세탁 가능, 다림질 주의',
    createdAt: new Date(),
  };

  const mockMaterialWithSymbols = {
    ...mockMaterial,
    materialSymbols: [
      {
        frequency: Frequency.ALWAYS,
        note: '세탁 시 주의',
        symbol: {
          id: 'symbol-1',
          code: 'W30',
          iconUrl: 'https://example.com/icon.png',
          category: SymbolCategory.WASH,
        },
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaterialsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MaterialsService>(MaterialsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all materials without search', async () => {
      mockPrismaService.material.findMany.mockResolvedValue([mockMaterial]);

      const result = await service.findAll();

      expect(result).toEqual({
        materials: [
          {
            id: mockMaterial.id,
            code: mockMaterial.code,
            nameKo: mockMaterial.nameKo,
            nameEn: mockMaterial.nameEn,
            nameJp: mockMaterial.nameJp,
            description: mockMaterial.description,
            careTips: mockMaterial.careTips,
            createdAt: mockMaterial.createdAt,
          },
        ],
        total: 1,
      });
      expect(mockPrismaService.material.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { nameKo: 'asc' },
      });
    });

    it('should return materials matching search query', async () => {
      mockPrismaService.material.findMany.mockResolvedValue([mockMaterial]);

      const result = await service.findAll('면');

      expect(result.total).toBe(1);
      expect(mockPrismaService.material.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { nameKo: { contains: '면', mode: 'insensitive' } },
            { nameEn: { contains: '면', mode: 'insensitive' } },
            { nameJp: { contains: '면', mode: 'insensitive' } },
            { code: { contains: '면', mode: 'insensitive' } },
          ],
        },
        orderBy: { nameKo: 'asc' },
      });
    });

    it('should return empty array when no materials found', async () => {
      mockPrismaService.material.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual({
        materials: [],
        total: 0,
      });
    });
  });

  describe('findById', () => {
    it('should return material with symbols', async () => {
      mockPrismaService.material.findUnique.mockResolvedValue(
        mockMaterialWithSymbols,
      );

      const result = await service.findById('material-1');

      expect(result.id).toBe(mockMaterial.id);
      expect(result.symbols).toHaveLength(1);
      expect(result.symbols[0].symbolId).toBe('symbol-1');
      expect(result.symbols[0].frequency).toBe(Frequency.ALWAYS);
    });

    it('should throw NotFoundException when material not found', async () => {
      mockPrismaService.material.findUnique.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByCode', () => {
    it('should return material by code', async () => {
      mockPrismaService.material.findUnique.mockResolvedValue(
        mockMaterialWithSymbols,
      );

      const result = await service.findByCode('COTTON');

      expect(result.code).toBe('COTTON');
    });

    it('should throw NotFoundException when material not found by code', async () => {
      mockPrismaService.material.findUnique.mockResolvedValue(null);

      await expect(service.findByCode('UNKNOWN')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('search', () => {
    it('should call findAll with query', async () => {
      mockPrismaService.material.findMany.mockResolvedValue([mockMaterial]);

      const result = await service.search('cotton');

      expect(result.total).toBe(1);
    });
  });
});

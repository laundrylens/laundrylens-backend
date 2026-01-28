import { Test, TestingModule } from '@nestjs/testing';
import { MaterialsController } from './materials.controller';
import { MaterialsService } from './materials.service';
import { Frequency, SymbolCategory } from '@prisma/client';

describe('MaterialsController', () => {
  let controller: MaterialsController;

  const mockMaterialsService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    search: jest.fn(),
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

  const mockMaterialDetail = {
    ...mockMaterial,
    symbols: [
      {
        symbolId: 'symbol-1',
        code: 'W30',
        iconUrl: 'https://example.com/icon.png',
        category: SymbolCategory.WASH,
        frequency: Frequency.ALWAYS,
        note: '세탁 시 주의',
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaterialsController],
      providers: [
        {
          provide: MaterialsService,
          useValue: mockMaterialsService,
        },
      ],
    }).compile();

    controller = module.get<MaterialsController>(MaterialsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all materials', async () => {
      const mockResponse = {
        materials: [mockMaterial],
        total: 1,
      };
      mockMaterialsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll({});

      expect(result).toEqual(mockResponse);
      expect(mockMaterialsService.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should return materials with search query', async () => {
      const mockResponse = {
        materials: [mockMaterial],
        total: 1,
      };
      mockMaterialsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll({ search: '면' });

      expect(result).toEqual(mockResponse);
      expect(mockMaterialsService.findAll).toHaveBeenCalledWith('면');
    });
  });

  describe('search', () => {
    it('should search materials', async () => {
      const mockResponse = {
        materials: [mockMaterial],
        total: 1,
      };
      mockMaterialsService.search.mockResolvedValue(mockResponse);

      const result = await controller.search('cotton');

      expect(result).toEqual(mockResponse);
      expect(mockMaterialsService.search).toHaveBeenCalledWith('cotton');
    });

    it('should handle empty search query', async () => {
      const mockResponse = {
        materials: [],
        total: 0,
      };
      mockMaterialsService.search.mockResolvedValue(mockResponse);

      const result = await controller.search('');

      expect(result).toEqual(mockResponse);
      expect(mockMaterialsService.search).toHaveBeenCalledWith('');
    });
  });

  describe('findById', () => {
    it('should return material by id', async () => {
      mockMaterialsService.findById.mockResolvedValue(mockMaterialDetail);

      const result = await controller.findById('material-1');

      expect(result).toEqual(mockMaterialDetail);
      expect(mockMaterialsService.findById).toHaveBeenCalledWith('material-1');
    });
  });
});

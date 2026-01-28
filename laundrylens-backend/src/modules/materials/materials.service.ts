import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import {
  MaterialResponseDto,
  MaterialDetailResponseDto,
  MaterialListResponseDto,
  MaterialSymbolDto,
} from './dto';

@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string): Promise<MaterialListResponseDto> {
    const where = search
      ? {
          OR: [
            { nameKo: { contains: search, mode: 'insensitive' as const } },
            { nameEn: { contains: search, mode: 'insensitive' as const } },
            { nameJp: { contains: search, mode: 'insensitive' as const } },
            { code: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const materials = await this.prisma.material.findMany({
      where,
      orderBy: { nameKo: 'asc' },
    });

    return {
      materials: materials.map((material) => this.toResponseDto(material)),
      total: materials.length,
    };
  }

  async findById(id: string): Promise<MaterialDetailResponseDto> {
    const material = await this.prisma.material.findUnique({
      where: { id },
      include: {
        materialSymbols: {
          include: {
            symbol: true,
          },
          orderBy: {
            frequency: 'asc',
          },
        },
      },
    });

    if (!material) {
      throw new NotFoundException('소재를 찾을 수 없습니다.');
    }

    return this.toDetailResponseDto(material);
  }

  async findByCode(code: string): Promise<MaterialDetailResponseDto> {
    const material = await this.prisma.material.findUnique({
      where: { code },
      include: {
        materialSymbols: {
          include: {
            symbol: true,
          },
          orderBy: {
            frequency: 'asc',
          },
        },
      },
    });

    if (!material) {
      throw new NotFoundException('소재를 찾을 수 없습니다.');
    }

    return this.toDetailResponseDto(material);
  }

  async search(query: string): Promise<MaterialListResponseDto> {
    return this.findAll(query);
  }

  private toResponseDto(material: {
    id: string;
    code: string;
    nameKo: string;
    nameEn: string;
    nameJp: string;
    description: string | null;
    careTips: string | null;
    createdAt: Date;
  }): MaterialResponseDto {
    return {
      id: material.id,
      code: material.code,
      nameKo: material.nameKo,
      nameEn: material.nameEn,
      nameJp: material.nameJp,
      description: material.description,
      careTips: material.careTips,
      createdAt: material.createdAt,
    };
  }

  private toDetailResponseDto(material: {
    id: string;
    code: string;
    nameKo: string;
    nameEn: string;
    nameJp: string;
    description: string | null;
    careTips: string | null;
    createdAt: Date;
    materialSymbols: Array<{
      frequency: string;
      note: string | null;
      symbol: {
        id: string;
        code: string;
        iconUrl: string | null;
        category: string;
      };
    }>;
  }): MaterialDetailResponseDto {
    const symbols: MaterialSymbolDto[] = material.materialSymbols.map((ms) => ({
      symbolId: ms.symbol.id,
      code: ms.symbol.code,
      iconUrl: ms.symbol.iconUrl,
      category: ms.symbol.category,
      frequency: ms.frequency as MaterialSymbolDto['frequency'],
      note: ms.note,
    }));

    return {
      ...this.toResponseDto(material),
      symbols,
    };
  }
}

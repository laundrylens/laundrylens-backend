import { Injectable, NotFoundException } from '@nestjs/common';
import { SymbolCategory } from '@prisma/client';
import { PrismaService } from '../../prisma';

@Injectable()
export class SymbolsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(category?: SymbolCategory) {
    const where = category ? { category } : {};

    const [symbols, total] = await Promise.all([
      this.prisma.laundrySymbol.findMany({
        where,
        orderBy: [{ category: 'asc' }, { code: 'asc' }],
      }),
      this.prisma.laundrySymbol.count({ where }),
    ]);

    return { symbols, total };
  }

  async findById(id: string, lang = 'ko') {
    const symbol = await this.prisma.laundrySymbol.findUnique({
      where: { id },
      include: {
        translations: {
          where: { countryCode: lang },
        },
      },
    });

    if (!symbol) {
      throw new NotFoundException('기호를 찾을 수 없습니다.');
    }

    return symbol;
  }

  async findByCode(code: string, lang = 'ko') {
    const symbol = await this.prisma.laundrySymbol.findUnique({
      where: { code },
      include: {
        translations: {
          where: { countryCode: lang },
        },
      },
    });

    if (!symbol) {
      throw new NotFoundException('기호를 찾을 수 없습니다.');
    }

    return symbol;
  }

  async findByCategory(category: SymbolCategory, lang = 'ko') {
    return this.prisma.laundrySymbol.findMany({
      where: { category },
      include: {
        translations: {
          where: { countryCode: lang },
        },
      },
      orderBy: { code: 'asc' },
    });
  }

  getSupportedCountries() {
    // 지원 국가 목록 (하드코딩)
    const countries = [
      { code: 'ko', nameKo: '한국어', nameEn: 'Korean' },
      { code: 'en', nameKo: '영어', nameEn: 'English' },
      { code: 'jp', nameKo: '일본어', nameEn: 'Japanese' },
    ];

    return { countries };
  }
}
